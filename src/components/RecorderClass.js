import mic from 'microphone-stream'
import crypto from 'crypto'
import { pcmEncode, downsampleBuffer } from '../audioUtils'
import { createPresignedURL } from '../aws-signature-v4'
import { EventStreamMarshaller } from '@aws-sdk/eventstream-marshaller'
import { toUtf8, fromUtf8 } from '@aws-sdk/util-utf8-node'

export default class MicRecorder {
    constructor() {

        this.supported = false
        this.stream = null
        this.mediaRecorder = null
        this.chunks = []
        this.blob = null
        this.mic = null
        this.inputSampleRate = null
        this.sampleRate = 44100
        this.region = 'us-east-1'
        this.languageCode = 'es-US'
        this.endpoint = "transcribestreaming." + this.region + ".amazonaws.com:8443"

        this.access_key = 'AKIA4JJ5LINICR5HZ2DS'
        this.secret_key = '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'
        this.session_token = ''
        this.presigned_url = ''

        this.eventStreamMarshaller = new EventStreamMarshaller(toUtf8, fromUtf8)

        this.transcription = ''
        this.transcribeException = false

        this.socket = null
        this.socketError = false


        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.supported = true
            console.log('getUserMedia supported.')
        } else {
            console.log('getUserMedia not supported on your browser!')
        }

    }

    init = async () => {

        if (!this.supported) return

        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })

        this.mic = new mic()
        this.mic.on('format', (data) => { this.inputSampleRate = data.sampleRate })
        this.mic.setStream(this.stream)

        this.presigned_url = this.createPresignedUrl()
        this.socket = new WebSocket(this.presigned_url)
        this.socket.binaryType = "arraybuffer"


        this.socket.onopen = () => {
            this.mic.on('data', (rawAudioChunk) => {
                // the audio stream is raw audio bytes. Transcribe expects PCM with additional metadata, encoded as binary
                let binary = this.convertAudioToBinaryMessage(rawAudioChunk)

                if (this.socket.readyState === this.socket.OPEN) {
                    this.socket.send(binary)
                }

            })
        }

        this.wireSocketEvents()
    }

    handleEventStreamMessage = (messageJson) => {
        let results = messageJson.Transcript.Results;

        if (results.length > 0) {
            if (results[0].Alternatives.length > 0) {
                let transcript = results[0].Alternatives[0].Transcript
                transcript = decodeURIComponent(escape(transcript))
                //console.log(this.transcription + transcript)
                if (!results[0].IsPartial) {
                    this.transcription += transcript + "\n"
                    console.log(this.transcription)
                    this.logger.createComment(this.transcription)
                    this.transcription =''
                }
            }
        }
    }

    wireSocketEvents = () => {
        // handle inbound messages from Amazon Transcribe
        this.socket.onmessage = (message) => {
            //convert the binary event stream message to JSON
            let messageWrapper = this.eventStreamMarshaller.unmarshall(Buffer(message.data));
            let messageBody = JSON.parse(String.fromCharCode.apply(String, messageWrapper.body));
            if (messageWrapper.headers[":message-type"].value === "event") {
                this.handleEventStreamMessage(messageBody);
            }
            else {
                this.transcribeException = true;
                console.error(messageBody.Message)
            }
        }

        this.socket.onerror = () => {
            this.socketError = true;
            console.error('WebSocket connection error. Try again.');
        }

        this.socket.onclose = (closeEvent) => {
            this.mic.stop();

            // the close event immediately follows the error event; only handle one.
            if (!this.socketError && !this.transcribeException) {
                if (closeEvent.code !== 1000) {
                    console.error('Streaming Exception:' + closeEvent.reason);
                }
            }
        }
    }

    closeSocket =  () => {
        if (this.socket.readyState === this.socket.OPEN) {
            this.mic.stop();
    
            // Send an empty frame so that Transcribe initiates a closure of the WebSocket after submitting all transcripts
            let emptyMessage = this.getAudioEventMessage(Buffer.from(new Buffer([])));
            let emptyBuffer = this.eventStreamMarshaller.marshall(emptyMessage);
            this.socket.send(emptyBuffer);
        }
    }


    processChunks = () => {
        this.blob = new Blob(this.chunks, { 'type': 'audio/ogg codecs=opus' })
        this.chunks = []
        console.log(this.blob)

    }

    createPresignedUrl = () => {
        // get a preauthenticated URL that we can use to establish our WebSocket
        return createPresignedURL(
            'GET',
            this.endpoint,
            '/stream-transcription-websocket',
            'transcribe',
            crypto.createHash('sha256').update('', 'utf8').digest('hex'), {
            'key': this.access_key,
            'secret': this.secret_key,
            'sessionToken': this.session_token,
            'protocol': 'wss',
            'expires': 60,
            'region': this.region,
            'query': "language-code=" + this.languageCode + "&media-encoding=pcm&sample-rate=" + this.sampleRate
        }
        )
    }

    convertAudioToBinaryMessage = (audioChunk) => {
        let raw = mic.toRaw(audioChunk)

        if (raw == null) return

        // downsample and convert the raw audio bytes to PCM
        let downsampledBuffer = downsampleBuffer(raw, this.inputSampleRate, this.sampleRate)
        let pcmEncodedBuffer = pcmEncode(downsampledBuffer)

        // add the right JSON headers and structure to the message
        let audioEventMessage = this.getAudioEventMessage(Buffer.from(pcmEncodedBuffer))

        //convert the JSON object + headers into a binary event stream message
        let binary = this.eventStreamMarshaller.marshall(audioEventMessage)

        return binary
    }

    getAudioEventMessage = (buffer) => {
        // wrap the audio data in a JSON envelope
        return {
            headers: {
                ':message-type': {
                    type: 'string',
                    value: 'event'
                },
                ':event-type': {
                    type: 'string',
                    value: 'AudioEvent'
                }
            },
            body: buffer
        }
    }

}

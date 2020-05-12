

export default class MicRecorder {
    constructor() {

        this.supported = false
        this.stream = null
        this.mediaRecorder = null
        this.chunks = []
        this.blob = null

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.supported = true
            console.log('getUserMedia supported.')
        } else {
            console.log('getUserMedia not supported on your browser!')
        }
    }

    init = async () => {

        if (!this.supported) return 

        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        this.mediaRecorder = new MediaRecorder(this.stream);

        this.mediaRecorder.ondataavailable = (e) => {
            this.chunks.push(e.data)
            console.log(e.data)
        }

        this.mediaRecorder.onstop = (e) => {
            console.log("recorder stopped");
            this.processChunks()
        }
    }

    start = (ms) => {
        if (this.mediaRecorder === null) return

        this.mediaRecorder.start(ms)
        console.log("recorder started, recording every " + ms + " ms")
    }

    processChunks = () => {
        this.blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' })
        this.chunks = []
        console.log(this.blob)
    }
}

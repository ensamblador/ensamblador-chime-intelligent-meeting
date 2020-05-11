import {
    ConsoleLogger,
    MeetingSessionPOSTLogger,
    LogLevel,
    MeetingSessionConfiguration,
    DefaultMeetingSession,
    DefaultDeviceController,
    DefaultActiveSpeakerPolicy
} from 'amazon-chime-sdk-js'

import {
    populateDeviceList,
    populateInMeetingDeviceList,
    updateRoster,
    tileIdForAttendeeId,
    getVisibleTileIndices,
    getActiveTileId,
    layoutVideoTilesActiveSpeaker,
    layoutVideoTilesGrid,
    hideTile,
    setAudioPreviewPercent,
    toggleButton,
    displayButtonStates
} from './utils'


export default class MeetingClass {
    constructor() {
        this.roster = {}
        this.buttonStates = {
            'button-microphone': true,
            'button-camera': false,
            'button-speaker': true,
            'button-screen-share': false,
            'button-screen-view': false,
            'button-pause-screen-share': false,
        }
        this.tileIndexToTileId = {}
        this.tileIdToTileIndex = {}
        this.showActiveSpeakerScores = false
        this.selectedVideoInput = null
        this.canStartLocalVideo = true
        this.cameraDeviceIds = []
        this.microphoneDeviceIds = []
        this.enableWebAudio = false
        this.enableUnifiedPlanForChromiumBasedBrowsers = true
    }

    log = (str) => { console.log(`[DEMO] ${str}`) }

    setEndpoint = (endpoint) => {
        this.endpoint = endpoint
    }

    joinMeeting = async (meeting, name, region) => {
        const response = await fetch(
            this.endpoint.join +
            "?title=" +
            meeting +
            "&name=" +
            name +
            "&region=" +
            region,
            {
                method: "POST",
                headers: new Headers(),
                mode: "cors",
            }
        )

        const json = await response.json()
        if (json.error) { throw new Error(`Server error: ${json.error}`) }
        return json
    }

    authenticate = async (meeting, name, region) => {
        let joinInfo = (await this.joinMeeting(meeting, name, region)).JoinInfo
        this.configuration = new MeetingSessionConfiguration(joinInfo.Meeting, joinInfo.Attendee)
    }

    initializeMeetingSession = async () => {
        let logger
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            logger = new ConsoleLogger("SDK", LogLevel.INFO)
        else
            logger = new MeetingSessionPOSTLogger("SDK", this.configuration, 85, 1150, 'logs', LogLevel.INFO)

        this.deviceController = new DefaultDeviceController(logger)
        this.configuration.enableWebAudio = this.enableWebAudio
        this.configuration.enableUnifiedPlanForChromiumBasedBrowsers = this.enableUnifiedPlanForChromiumBasedBrowsers
        this.meetingSession = new DefaultMeetingSession(this.configuration, logger, this.deviceController)
        this.audioVideo = this.meetingSession.audioVideo
        this.audioVideo.addDeviceChangeObserver(this)

        this.audioVideo.setDeviceLabelTrigger(
            async () => {
                this.setFlow('flow-need-permission')
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                this.setFlow('flow-devices')
                return stream
            }
        )
    }

    initializeDevices = async () => {
        await this.populateAllDeviceLists()
        this.setupMuteHandler()
        this.setupCanUnmuteHandler()
        this.setupSubscribeToAttendeeIdPresenceHandler()
        this.setupScreenViewing()
        this.audioVideo.addObserver(this)
        await this.openAudioInputFromSelection()
        await this.openVideoInputFromSelection(document.getElementById('video-input').value, true)
        await this.openAudioOutputFromSelection()

    }

    populateAllDeviceLists = async () => {
        populateDeviceList('audio-input', 'Microphone', await this.audioVideo.listAudioInputDevices(), ['None', '440 Hz'])
        populateDeviceList('video-input', 'Camera', await this.audioVideo.listVideoInputDevices(), ['None', 'Blue', 'SMPTE Color Bars'])
        populateDeviceList('audio-output', 'Speaker', await this.audioVideo.listAudioOutputDevices(), [])
        const cameras = await this.audioVideo.listVideoInputDevices()
        this.cameraDeviceIds = cameras.map(deviceInfo => { return deviceInfo.deviceId })
    }

    populateAllMeetingDeviceLists = async () => {
        populateInMeetingDeviceList('dropdown-menu-microphone', 'Microphone', await this.audioVideo.listAudioInputDevices(), ['None', '440 Hz'],
            async (name) => { await this.audioVideo.chooseAudioInputDevice(this.audioInputSelectionToDevice(name)) })

        populateInMeetingDeviceList('dropdown-menu-camera', 'Camera',
            await this.audioVideo.listVideoInputDevices(),
            ['None', 'Blue', 'SMPTE Color Bars'],
            async (name) => {
                try {
                    await this.openVideoInputFromSelection(name, false);
                } catch (err) {
                    this.log('no video input device selected');
                }
            }
        )
        populateInMeetingDeviceList('dropdown-menu-speaker', 'Speaker', await this.audioVideo.listAudioOutputDevices(), [],
        async (name) => { await this.audioVideo.chooseAudioOutputDevice(name)})

        const cameras = await this.audioVideo.listVideoInputDevices()
        this.cameraDeviceIds = cameras.map(deviceInfo => { return deviceInfo.deviceId })
    }



    setupMuteHandler = () => {
        const handler = (isMuted) => { this.log(`muted = ${isMuted}`) }
        this.audioVideo.realtimeSubscribeToMuteAndUnmuteLocalAudio(handler)
        const isMuted = this.audioVideo.realtimeIsLocalAudioMuted()
        handler(isMuted)
    }

    setupCanUnmuteHandler = () => {
        const handler = (canUnmute) => {
            this.log(`canUnmute = ${canUnmute}`)
        }
        this.audioVideo.realtimeSubscribeToSetCanUnmuteLocalAudio(handler)
        handler(this.audioVideo.realtimeCanUnmuteLocalAudio())
    }

    layoutVideoTiles = () => {
        if (!this.meetingSession) return
        const selfAttendeeId = this.meetingSession.configuration.credentials.attendeeId
        const selfTileId = tileIdForAttendeeId(selfAttendeeId, this.audioVideo)
        const visibleTileIndices = getVisibleTileIndices()
        let activeTileId = getActiveTileId(this.roster, this.audioVideo)
        const selfIsVisible = visibleTileIndices.includes(this.tileIdToTileIndex[selfTileId])
        if (visibleTileIndices.length === 2 && selfIsVisible) {
            activeTileId = this.tileIndexToTileId[
                visibleTileIndices[0] === selfTileId ? visibleTileIndices[1] : visibleTileIndices[0]
            ]
        }
        const hasVisibleActiveSpeaker = visibleTileIndices.includes(this.tileIdToTileIndex[activeTileId])
        if (true && hasVisibleActiveSpeaker) {
            layoutVideoTilesActiveSpeaker(visibleTileIndices, activeTileId, this.tileIndexToTileId)
        } else {
            layoutVideoTilesGrid(visibleTileIndices)
        }
    }

    setupSubscribeToAttendeeIdPresenceHandler = () => {
        const handler = (attendeeId, present) => {
            this.log(`${attendeeId} present = ${present}`)
            if (!present) {
                delete this.roster[attendeeId]
                updateRoster()
                return
            }
            this.audioVideo.realtimeSubscribeToVolumeIndicator(attendeeId,
                async (
                    attendeeId,
                    volume,
                    muted,
                    signalStrength,
                    externalUserId
                ) => {
                    if (!this.roster[attendeeId]) {
                        this.roster[attendeeId] = { name: '' }
                    }
                    if (volume !== null) {
                        this.roster[attendeeId].volume = Math.round(volume * 100)
                    }
                    if (muted !== null) {
                        this.roster[attendeeId].muted = muted
                    }
                    if (signalStrength !== null) {
                        this.roster[attendeeId].signalStrength = Math.round(signalStrength * 100)
                    }
                    this.roster[attendeeId].name = externalUserId.split('#')[1]
                    updateRoster()
                }
            )
        }
        this.audioVideo.realtimeSubscribeToAttendeeIdPresence(handler)
        const activeSpeakerHandler = (attendeeIds) => {
            for (const attendeeId in this.roster) { this.roster[attendeeId].active = false }
            for (const attendeeId of attendeeIds) {
                if (this.roster[attendeeId]) {
                    this.roster[attendeeId].active = true
                    break // only show the most active speaker
                }
            }
            this.layoutVideoTiles()
        }
        this.audioVideo.subscribeToActiveSpeakerDetector(
            new DefaultActiveSpeakerPolicy(),
            activeSpeakerHandler,
            (scores) => {
                for (const attendeeId in scores) {
                    if (this.roster[attendeeId]) {
                        this.roster[attendeeId].score = scores[attendeeId]
                    }
                }
                updateRoster()
            },
            this.showActiveSpeakerScores ? 100 : 0
        )
    }

    setupScreenViewing = () => {
        const self = this
        this.meetingSession.screenShareView.registerObserver({
            streamDidStart: (screenMessageDetail) => {
                const rosterEntry = self.roster[screenMessageDetail.attendeeId]
                document.getElementById('nameplate-17').innerHTML = rosterEntry ? rosterEntry.name : ''
            },
            streamDidStop: (_screenMessageDetail) => {
                document.getElementById('nameplate-17').innerHTML = 'No one is sharing screen'
            },
        })
    }

    openAudioInputFromSelection = async () => {
        const audioInputElem = document.getElementById('audio-input')
        await this.audioVideo.chooseAudioInputDevice(
            this.audioInputSelectionToDevice(audioInputElem.value)
        )
        this.startAudioPreview()
    }

    audioInputSelectionToDevice = (value) => {
        if (value === '440 Hz') {
            return DefaultDeviceController.synthesizeAudioDevice(440)
        } else if (value === 'None') {
            return null
        }
        return value
    }

    startAudioPreview = () => {
        setAudioPreviewPercent(0)
        const analyserNode = this.audioVideo.createAnalyserNodeForAudioInput()
        if (!analyserNode) return
        if (!analyserNode.getByteTimeDomainData) {
            document.getElementById('audio-preview').parentElement.style.visibility = 'hidden'
            return
        }
        const data = new Uint8Array(analyserNode.fftSize)
        let frameIndex = 0
        const analyserNodeCallback = () => {
            if (frameIndex === 0) {
                analyserNode.getByteTimeDomainData(data)
                const lowest = 0.01
                let max = lowest
                for (const f of data) {
                    max = Math.max(max, (f - 128) / 128)
                }
                let normalized = (Math.log(lowest) - Math.log(max)) / Math.log(lowest)
                let percent = Math.min(Math.max(normalized * 100, 0), 100)
                setAudioPreviewPercent(percent)
            }
            frameIndex = (frameIndex + 1) % 2
            requestAnimationFrame(analyserNodeCallback)
        }
        requestAnimationFrame(analyserNodeCallback)
    }

    openVideoInputFromSelection = async (selection, showPreview) => {

        if (selection) { this.selectedVideoInput = selection }

        this.log(`Switching to: ${this.selectedVideoInput}`)

        const device = this.videoInputSelectionToDevice(this.selectedVideoInput)
        if (device === null) {

            if (showPreview) { this.audioVideo.stopVideoPreviewForVideoInput(document.getElementById('video-preview')) }
            this.audioVideo.stopLocalVideoTile()
            toggleButton(this.buttonStates, 'button-camera', 'off')
            // choose video input null is redundant since we expect stopLocalVideoTile to clean up
            await this.audioVideo.chooseVideoInputDevice(device)
            throw new Error('no video device selected')
        }
        await this.audioVideo.chooseVideoInputDevice(device)
        if (showPreview) {
            this.audioVideo.startVideoPreviewForVideoInput(document.getElementById('video-preview'))
        }
    }

    videoInputSelectionToDevice = (value) => {
        if (value === 'Blue') {
            return DefaultDeviceController.synthesizeVideoDevice('blue')
        } else if (value === 'SMPTE Color Bars') {
            return DefaultDeviceController.synthesizeVideoDevice('smpte')
        } else if (value === 'None') {
            return null
        }
        return value
    }

    openAudioOutputFromSelection = async () => {
        const audioOutput = document.getElementById('audio-output')
        await this.audioVideo.chooseAudioOutputDevice(audioOutput.value)
    }
    join = async () => {
        window.addEventListener('unhandledrejection', (event) => { this.log(event.reason) })
        await this.populateAllMeetingDeviceLists()
        await this.openAudioInputFromSelection()
        await this.openAudioOutputFromSelection()
        this.audioVideo.start()
        await this.meetingSession.screenShare.open()
        await this.meetingSession.screenShareView.open()
        this.audioVideo.stopVideoPreviewForVideoInput(document.getElementById('video-preview'))
        this.audioVideo.chooseVideoInputDevice(null)
        this.audioVideo.startVideoPreviewForVideoInput(document.getElementById('video-preview'))
        displayButtonStates()

    }

    videoAvailabilityDidChange = (availability) => {
        this.canStartLocalVideo = availability.canStartLocalVideo
        this.log(`video availability changed: canStartLocalVideo  ${availability.canStartLocalVideo}`)
    }

    buttonCameraClick = async (e) => {
        if (toggleButton(this.buttonStates, 'button-camera') && this.canStartLocalVideo) {
            try {
                const videoInput = document.getElementById('video-input')
                let camera = videoInput.value
                if (videoInput.value === 'None') {
                    camera = this.cameraDeviceIds.length ? this.cameraDeviceIds[0] : 'None'
                }
                await this.openVideoInputFromSelection(camera, false)
                this.audioVideo.startLocalVideoTile()
            } catch (err) {
                this.log('no video input device selected')
            }
        } else {
            this.audioVideo.stopLocalVideoTile()
            hideTile(16, this.layoutVideoTiles)
        }
    }

    buttonMicrophoneClick = async () => {
        if (toggleButton(this.buttonStates, 'button-microphone')) {
            this.audioVideo.realtimeUnmuteLocalAudio()
        } else {
            this.audioVideo.realtimeMuteLocalAudio()
        }
    }

    buttonScreenShareClick = async () => {
        const button1 = 'button-screen-share'
        const button2 = 'button-pause-screen-share'
        if (this.buttonStates[button1]) {
            this.meetingSession.screenShare
                .stop()
                .catch(error => {
                    this.log(error)
                })
                .finally(() => {
                    this.buttonStates[button1] = false
                    this.buttonStates[button2] = false
                    displayButtonStates(this.buttonStates)
                })
        } else {
            const self = this
            const observer = {
                didStopScreenSharing() {
                    self.buttonStates[button1] = false
                    self.buttonStates[button2] = false
                    displayButtonStates(self.buttonStates)
                },
            }
            this.meetingSession.screenShare.registerObserver(observer)
            this.meetingSession.screenShare.start().then(() => {
                this.buttonStates[button1] = true
                displayButtonStates(this.buttonStates)
            })
        }
    }

    audioInputChange = async () => {
        this.log('audio input device is changed');
        await this.openAudioInputFromSelection();
    }

    videoInputChange = async (e) => {
        this.log('video input device is changed');
        try {
            await this.openVideoInputFromSelection(e.target.value, true);
        } catch (err) {
            this.log('no video input device selected');
        }
    }

    videoInputQualityChange = async (e) => {
        this.log('Video input quality is changed');
        switch (e.target.value) {
            case '360p':
                this.audioVideo.chooseVideoInputQuality(640, 360, 15, 600);
                break;
            case '540p':
                this.audioVideo.chooseVideoInputQuality(960, 540, 15, 1400);
                break;
            case '720p':
                this.audioVideo.chooseVideoInputQuality(1280, 720, 15, 1400);
                break;
            default:
                break
        }
        try {
            await this.openVideoInputFromSelection(e.target.value, true);
        } catch (err) {
            this.log('no video input device selected');
        }
    }

    audioOutputChange = async (e) => {
        this.log('audio output device is changed');
        await this.openAudioOutputFromSelection();
    }

    audioInputsChanged = (_freshAudioInputDeviceList) => {
        this.populateAudioInputList();
    }

    videoInputsChanged = (_freshVideoInputDeviceList) => {
        this.populateVideoInputList()
    }

    audioOutputsChanged = (_freshAudioOutputDeviceList) => {
        this.populateAudioOutputList();
    }

    populateAudioOutputList = async () => {
        this.populateDeviceList('audio-output', 'Speaker', await this.audioVideo.listAudioOutputDevices(), [])
        this.populateInMeetingDeviceList(
            'dropdown-menu-speaker',
            'Speaker',
            await this.audioVideo.listAudioOutputDevices(),
            [],
            async (name) => {
                await this.audioVideo.chooseAudioOutputDevice(name);
            }
        );
    }

}



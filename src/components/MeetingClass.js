import {
    ConsoleLogger,
    MeetingSessionPOSTLogger,
    LogLevel,
    MeetingSessionStatusCode,
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

import MicRecorder from './RecorderClass'
import Logger from './LoggerClass'

class DemoTileOrganizer {
    constructor() {
        this.MAX_TILES = 16
        this.tiles = {}
        this.tileStates = {}
    }
    acquireTileIndex = (tileId) => {
        for (let index = 0; index < this.MAX_TILES; index++) {
            if (this.tiles[index] === tileId) {
                return index;
            }
        }
        for (let index = 0; index < this.MAX_TILES; index++) {
            if (!(index in this.tiles)) {
                this.tiles[index] = tileId;
                return index;
            }
        }
        throw new Error('no tiles are available');
    }

    releaseTileIndex = (tileId) => {
        for (let index = 0; index < this.MAX_TILES; index++) {
            if (this.tiles[index] === tileId) {
                delete this.tiles[index];
                return index;
            }
        }
        return this.MAX_TILES;
    }
}


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
        this.analyserNodeCallback = () => { }
        this.tileOrganizer = new DemoTileOrganizer();
        this.recorder = new MicRecorder()
        this.logger  = new Logger()
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
        this.meeting = meeting
        this.name = name
        this.region = region


        return json
    }

    endMeeting = async () => {
        await fetch(this.endpoint.end + "?title=" + this.meeting, { method: 'POST', headers: new Headers(), mode: "cors" })
        this.logger.end()

    }

    leave = () => {
        this.meetingSession.screenShare
            .stop()
            .catch(() => { })
            .finally(() => {
                return this.meetingSession.screenShare.close();
            });
        this.meetingSession.screenShareView.close();
        this.audioVideo.stop();
        this.roster = {};
        this.logger.leave()
    }

    authenticate = async (meeting, name, region) => {
        let joinInfo = (await this.joinMeeting(meeting, name, region)).JoinInfo
        this.configuration = new MeetingSessionConfiguration(joinInfo.Meeting, joinInfo.Attendee)
        this.logger.joined(joinInfo.Meeting.Meeting, joinInfo.Attendee.Attendee)
        return joinInfo.Meeting.Meeting.MeetingId
    }

    initializeMeetingSession = async () => {
        let logger
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
            logger = new ConsoleLogger("SDK", LogLevel.ERROR)
        else
            logger = new MeetingSessionPOSTLogger("SDK", this.configuration, 85, 1150, this.endpoint.logs, LogLevel.ERROR)

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
        this.startAudioPreview()

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
            async (name) => { await this.audioVideo.chooseAudioOutputDevice(name) })

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
                updateRoster(this.roster)
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
                    updateRoster(this.roster)
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
                updateRoster(this.roster)
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
        let audioInputElem = null
        if (document.getElementById('audio-input') !== null)
            audioInputElem = document.getElementById('audio-input')
        if (document.getElementById('dropdown-menu-microphone') !== null)
            audioInputElem = document.getElementById('dropdown-menu-microphone')

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
        this.analyserNodeCallback = () => {
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
            requestAnimationFrame(this.analyserNodeCallback)
        }
        requestAnimationFrame(this.analyserNodeCallback)
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
        let audioOutput = null

        if (document.getElementById('audio-output') !== null)
            audioOutput = document.getElementById('audio-output')
        if (document.getElementById('dropdown-menu-speaker') !== null)
            audioOutput = document.getElementById('dropdown-menu-speaker')
        await this.audioVideo.chooseAudioOutputDevice(audioOutput.value)

        if (document.getElementById('meeting-audio') !== null)
            await this.audioVideo.bindAudioElement(document.getElementById('meeting-audio'));
    }

    startJoining = async () => {
        await this.openAudioInputFromSelection()
        await this.openAudioOutputFromSelection()
        this.audioVideo.start()
        await this.meetingSession.screenShare.open()
        await this.meetingSession.screenShareView.open()
        this.audioVideo.stopVideoPreviewForVideoInput(document.getElementById('video-preview'))
        this.audioVideo.chooseVideoInputDevice(null)
    }

    finishJoin = async (logger) => {
        window.addEventListener('unhandledrejection', (event) => { this.log(event.reason) })
        await this.populateAllMeetingDeviceLists()
        await this.openAudioOutputFromSelection()
        displayButtonStates()
        await this.recorder.init()
        this.recorder.logger = this.logger
    }

    videoAvailabilityDidChange = (availability) => {
        this.canStartLocalVideo = availability.canStartLocalVideo
        this.log(`video availability changed: canStartLocalVideo  ${availability.canStartLocalVideo}`)
    }

    buttonCameraClick = async (e) => {
        if (toggleButton(this.buttonStates, 'button-camera') && this.canStartLocalVideo) {
            try {
                let camera = this.selectedVideoInput
                if (this.selectedVideoInput === 'None') {
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

    buttonPauseScreenShareClick = async () => {
        const button = 'button-pause-screen-share';
        if (this.buttonStates[button]) {
            this.meetingSession.screenShare.unpause().then(() => {
                this.buttonStates[button] = false;
                displayButtonStates(this.buttonStates);
            });
        } else {
            const self = this;
            const observer = {
                didUnpauseScreenSharing() {
                    self.buttonStates[button] = false;
                    displayButtonStates(self.buttonStates);
                },
            };
            this.meetingSession.screenShare.registerObserver(observer);
            this.meetingSession.screenShare
                .pause()
                .then(() => {
                    this.buttonStates[button] = true;
                    displayButtonStates(this.buttonStates);
                })
                .catch(error => {
                    this.log(error);
                });
        }
    }

    buttonSpeakerClick = async () => {
        if (toggleButton(this.buttonStates, 'button-speaker')) {
            this.audioVideo.bindAudioElement(document.getElementById('meeting-audio'))
        } else {
            this.audioVideo.unbindAudioElement();
        }
    }

    buttonScreenViewClick = async () => {
        if (toggleButton(this.buttonStates, 'button-screen-view')) {
            const screenViewDiv = document.getElementById('tile-17')
            screenViewDiv.style.display = 'block';
            this.meetingSession.screenShareView.start(screenViewDiv);
        } else {
            this.meetingSession.screenShareView
                .stop()
                .catch(error => {
                    this.log(error);
                })
                .finally(() => hideTile(17, this.layoutVideoTiles));
        }
        this.layoutVideoTiles();
    }

    buttonMeetingEndClick = async (e) => {
        const confirmEnd = new URL(window.location.href).searchParams.get('confirm-end') === 'true';
        const prompt =
            'Are you sure you want to end the meeting for everyone? The meeting cannot be used after ending it.';
        if (confirmEnd && !window.confirm(prompt)) {
            return;
        }
        e.target.disabled = true;
        await this.endMeeting();
        this.leave();
        e.target.disabled = false;
        // @ts-ignore
        window.location = window.location.pathname;

    }

    buttonMeetingLeaveClick = async (e) => {
        e.target.disabled = true;
        this.leave();
        e.target.disabled = false;
        // @ts-ignore
        window.location = window.location.pathname;
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

    audioInputsChanged = async (_freshAudioInputDeviceList) => {
        if (document.getElementById('audio-input') !== null)
            populateDeviceList('audio-input', 'Microphone', await this.audioVideo.listAudioInputDevices(), ['None', '440 Hz'])

        if (document.getElementById('dropdown-menu-microphone') !== null)
            populateInMeetingDeviceList('dropdown-menu-microphone', 'Microphone', await this.audioVideo.listAudioInputDevices(), ['None', '440 Hz'],
                async (name) => { await this.audioVideo.chooseAudioInputDevice(this.audioInputSelectionToDevice(name)) })

    }

    videoInputsChanged = async (_freshVideoInputDeviceList) => {
        if (document.getElementById('video-input') !== null)
            populateDeviceList('video-input', 'Camera', await this.audioVideo.listVideoInputDevices(), ['None', 'Blue', 'SMPTE Color Bars'])

        if (document.getElementById('dropdown-menu-camera') !== null)
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
        const cameras = await this.audioVideo.listVideoInputDevices()
        this.cameraDeviceIds = cameras.map(deviceInfo => { return deviceInfo.deviceId })
    }

    audioOutputsChanged = async (_freshAudioOutputDeviceList) => {
        if (document.getElementById('audio-output') !== null)
            populateDeviceList('audio-output', 'Speaker', await this.audioVideo.listAudioOutputDevices(), [])

        if (document.getElementById('dropdown-menu-speaker') !== null)
            populateInMeetingDeviceList('dropdown-menu-speaker', 'Speaker', await this.audioVideo.listAudioOutputDevices(), [],
                async (name) => { await this.audioVideo.chooseAudioOutputDevice(name) })
    }

    connectionDidBecomePoor = () => {
        this.log('connection is poor');
    }

    connectionDidSuggestStopVideo = () => {
        this.log('suggest turning the video off');
    }

    videoSendDidBecomeUnavailable = () => {
        this.log('sending video is not available');
    }

    estimatedDownlinkBandwidthLessThanRequired = (estimatedDownlinkBandwidthKbps, requiredVideoDownlinkBandwidthKbps) => {
        this.log(`Estimated downlink bandwidth is ${estimatedDownlinkBandwidthKbps} is less than required bandwidth for video ${requiredVideoDownlinkBandwidthKbps}`)
    }

    videoNotReceivingEnoughData = (videoReceivingReports) => {
        this.log(`One or more video streams are not receiving expected amounts of data ${JSON.stringify(videoReceivingReports)}`
        )
    }

    metricsDidReceive = (clientMetricReport) => {
        const metricReport = clientMetricReport.getObservableMetrics();
        if (
            typeof metricReport.availableSendBandwidth === 'number' &&
            !isNaN(metricReport.availableSendBandwidth)
        ) {
            document.getElementById('video-uplink-bandwidth').innerHTML =
                'Available Uplink Bandwidth: ' +
                String(metricReport.availableSendBandwidth / 1000) +
                ' Kbps';
        } else if (
            typeof metricReport.availableOutgoingBitrate === 'number' &&
            !isNaN(metricReport.availableOutgoingBitrate)
        ) {
            document.getElementById('video-uplink-bandwidth').innerHTML =
                'Available Uplink Bandwidth: ' +
                String(metricReport.availableOutgoingBitrate / 1000) +
                ' Kbps';
        } else {
            document.getElementById('video-uplink-bandwidth').innerHTML =
                'Available Uplink Bandwidth: Unknown';
        }

        if (
            typeof metricReport.availableReceiveBandwidth === 'number' &&
            !isNaN(metricReport.availableReceiveBandwidth)
        ) {
            document.getElementById('video-downlink-bandwidth').innerHTML =
                'Available Downlink Bandwidth: ' +
                String(metricReport.availableReceiveBandwidth / 1000) +
                ' Kbps';
        } else if (
            typeof metricReport.availableIncomingBitrate === 'number' &&
            !isNaN(metricReport.availableIncomingBitrate)
        ) {
            document.getElementById('video-downlink-bandwidth').innerHTML =
                'Available Downlink Bandwidth: ' +
                String(metricReport.availableIncomingBitrate / 1000) +
                ' Kbps';
        } else {
            document.getElementById('video-downlink-bandwidth').innerHTML =
                'Available Downlink Bandwidth: Unknown';
        }
    }

    audioVideoDidStartConnecting = (reconnecting) => {
        this.log(`session connecting. reconnecting: ${reconnecting}`)
    }

    audioVideoDidStart = () => {
        this.log('session started')
    }

    audioVideoDidStop = (sessionStatus) => {
        this.log(`session stopped from ${JSON.stringify(sessionStatus)}`);
        if (sessionStatus.statusCode() === MeetingSessionStatusCode.AudioCallEnded) {
            this.log(`meeting ended`);
            // @ts-ignore
            window.location = window.location.pathname;
        }
    }

    videoTileDidUpdate = (tileState) => {

        //this.log(`video tile updated: ${JSON.stringify(tileState, null, '  ')}`);
        if (!tileState.boundAttendeeId) { return }
        const tileIndex = tileState.localTile ? 16 : this.tileOrganizer.acquireTileIndex(tileState.tileId);
        const tileElement = document.getElementById(`tile-${tileIndex}`)
        const videoElement = document.getElementById(`video-${tileIndex}`)
        const nameplateElement = document.getElementById(`nameplate-${tileIndex}`)

        const pauseButtonElement = document.getElementById(`video-pause-${tileIndex}`)
        const resumeButtonElement = document.getElementById(`video-resume-${tileIndex}`)

        pauseButtonElement.addEventListener('click', () => {
            if (!tileState.paused) {
                this.audioVideo.pauseVideoTile(tileState.tileId);
            }
        });

        resumeButtonElement.addEventListener('click', () => {
            if (tileState.paused) {
                this.audioVideo.unpauseVideoTile(tileState.tileId);
            }
        });

        this.log(`binding video tile ${tileState.tileId} to ${videoElement.id}`);
        this.audioVideo.bindVideoElement(tileState.tileId, videoElement);
        this.tileIndexToTileId[tileIndex] = tileState.tileId;
        this.tileIdToTileIndex[tileState.tileId] = tileIndex;
        const rosterName = tileState.boundExternalUserId.split('#')[1];
        if (nameplateElement.innerHTML !== rosterName) {
            nameplateElement.innerHTML = rosterName;
        }
        tileElement.style.display = 'block';
        this.layoutVideoTiles();
    }

    videoTileWasRemoved = (tileId) => {
        this.log(`video tile removed: ${tileId}`);
        hideTile(this.tileOrganizer.releaseTileIndex(tileId), this.layoutVideoTiles);
    }

    videoAvailabilityDidChange = (availability) => {
        this.canStartLocalVideo = availability.canStartLocalVideo;
        this.log(`video availability changed: canStartLocalVideo  ${availability.canStartLocalVideo}`);
    }
}


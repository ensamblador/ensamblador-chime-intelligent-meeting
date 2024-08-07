import React, { useState, useEffect } from "react"

const InMeeting = (props) => {
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done === false) {
      props.initMeeting()
      setDone(true)
    }
  }, [done, props])

  return (
    <div
      id="flow-meeting"
      className="flow"
      style={{
        position: "absolute",
        left: "15px",
        top: 0,
        bottom: "55px",
        right: "15px",
      }}
    >
      <div
        className="text-muted"
        style={{ position: "fixed", left: "3px", bottom: "3px" }}
        id="video-uplink-bandwidth"
      ></div>
      <div
        className="text-muted"
        style={{
          position: "fixed",
          left: "30%",
          width: "40%",
          textAlign: "center",
          bottom: "3px",
        }}
        id="chime-meeting-id"
      >
        {props.meetingId}
      </div>
      <div
        className="text-muted"
        style={{ position: "fixed", right: "3px", bottom: "3px" }}
        id="video-downlink-bandwidth"
      ></div>
      <audio id="meeting-audio" style={{ display: "none" }}></audio>
      <div className="container-fluid h-100">
        <div className="row">
          <div className="col-1 text-left">
            <div id="meeting-id" className="navbar-brand text-muted m-2">
              <p> {props.meeting} - {props.region}</p>
            </div>
          </div>
          <div className="col-5 text-right">
            <div
              className="btn-group m-2"
              role="group"
              aria-label="Toggle microphone"
            >
              <button
                onClick={props.MC.buttonMicrophoneClick}
                id="button-microphone"
                type="button"
                className="btn btn-success"
                title="Toggle microphone"
              >Mic
            </button>
              <div className="btn-group" role="group">
                <button
                  id="button-microphone-drop"
                  type="button"
                  className="btn btn-success dropdown-toggle"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  title="Select microphone"
                ></button>
                <div
                  id="dropdown-menu-microphone"
                  className="dropdown-menu"
                  aria-labelledby="button-microphone-drop"
                  x-placement="bottom-start"
                  style={{
                    position: "absolute",
                    transform: "translate3d(0px, 38px, 0px)",
                    top: "0px",
                    left: "0px",
                    willChange: "transform",
                  }}
                >
                  {/* eslint-disable-next-line */}
                  <a className="dropdown-item" href="#">
                    Default microphone
                </a>
                </div>
              </div>
            </div>
            <div
              className="btn-group m-2"
              role="group"
              aria-label="Toggle camera"
            >
              <button
                onClick={props.MC.buttonCameraClick}
                id="button-camera"
                type="button"
                className="btn btn-success"
                title="Toggle camera"
              >
                Video
            </button>
              <div className="btn-group" role="group">
                <button
                  id="button-camera-drop"
                  type="button"
                  className="btn btn-success dropdown-toggle"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  title="Select camera"
                ></button>
                <div
                  id="dropdown-menu-camera"
                  className="dropdown-menu"
                  aria-labelledby="button-camera-drop"
                  x-placement="bottom-start"
                  style={{
                    position: "absolute",
                    transform: "translate3d(0px, 38px, 0px)",
                    top: "0px",
                    left: "0px",
                    willChange: "transform",
                  }}
                >
                  {/* eslint-disable-next-line */}
                  <a className="dropdown-item" href="#">
                    Default camera
                </a>
                </div>
              </div>
            </div>
            <button
              id="button-screen-share"
              onClick={props.MC.buttonScreenShareClick}
              type="button"
              className="btn btn-outline-secondary m-2"
              title="Toggle screen share"
            >
              Screen Share
          </button>
            <button
              onClick={props.MC.buttonPauseScreenShareClick}
              id="button-pause-screen-share"
              type="button"
              className="btn btn-outline-secondary m-2"
              title="Pause/Unpause screen share"
            >
              Pause /unpause Screen Share
          </button>
          </div>
          <div id='chime-meeting-id'>
            Meeting ID: {props.meetingId}
          </div>
          <div className="col-4 text-left">
            <div
              className="btn-group m-2"
              role="group"
              aria-label="Toggle speaker"
            >
              <button
                id="button-speaker"
                onClick={props.MC.buttonSpeakerClick}
                type="button"
                className="btn btn-success"
                title="Toggle speaker"
              >Speaker
            </button>
              <div className="btn-group" role="group">
                <button
                  id="button-speaker-drop"
                  type="button"
                  className="btn btn-success dropdown-toggle"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                  title="Select speaker"
                ></button>
                <div
                  id="dropdown-menu-speaker"
                  className="dropdown-menu"
                  aria-labelledby="button-speaker-drop"
                  x-placement="bottom-start"
                  style={{
                    position: "absolute",
                    transform: "translate3d(0px, 38px, 0px)",
                    top: "0px",
                    left: "0px",
                    willChange: "transform",
                  }}
                >
                  {/* eslint-disable-next-line */}
                  <a className="dropdown-item" href="#">
                    Default speaker
                </a>
                </div>
              </div>
            </div>
            <button
              id="button-screen-view"
              onClick={props.MC.buttonScreenViewClick}
              type="button"
              className="btn btn-outline-secondary m-2"
              title="Toggle screen share view"
            >
              Toogle Screen Share View
          </button>
          </div>
          <div className="col-2 text-right">
            <button
              id="button-meeting-leave"
              onClick={props.MC.buttonMeetingLeaveClick}
              type="button"
              className="btn btn-outline-success m-2 px-4"
              title="Leave meeting"
            >
              Leave Meeting
          </button>
            <button
              id="button-meeting-end"
              onClick={props.MC.buttonMeetingEndClick}
              type="button"
              className="btn btn-outline-danger m-2 px-4"
              title="End meeting"
            >
              End Meeting
          </button>
          </div>
        </div>
        <div className="row h-100">
          <div className="col-sm-4">
            <div className="bs-component">
              <ul id="roster" className="list-group"></ul>
            </div>
          </div>
          <div className="col p-0">
            <div id="tile-area" className="w-100 h-100">
              <div id="tile-0" style={{ display: "none" }}>
                <video id="video-0" className="w-100 h-100"></video>
                <div id="nameplate-0"></div>
                <button id="video-pause-0">Pause</button>
                <button id="video-resume-0">Resume</button>
              </div>
              <div id="tile-1" style={{ display: "none" }}>
                <video id="video-1" className="w-100 h-100"></video>
                <div id="nameplate-1"></div>
                <button id="video-pause-1">Pause</button>
                <button id="video-resume-1">Resume</button>
              </div>
              <div id="tile-2" style={{ display: "none" }}>
                <video id="video-2" className="w-100 h-100"></video>
                <div id="nameplate-2"></div>
                <button id="video-pause-2">Pause</button>
                <button id="video-resume-2">Resume</button>
              </div>
              <div id="tile-3" style={{ display: "none" }}>
                <video id="video-3" className="w-100 h-100"></video>
                <div id="nameplate-3"></div>
                <button id="video-pause-3">Pause</button>
                <button id="video-resume-3">Resume</button>
              </div>
              <div id="tile-4" style={{ display: "none" }}>
                <video id="video-4" className="w-100 h-100"></video>
                <div id="nameplate-4"></div>
                <button id="video-pause-4">Pause</button>
                <button id="video-resume-4">Resume</button>
              </div>
              <div id="tile-5" style={{ display: "none" }}>
                <video id="video-5" className="w-100 h-100"></video>
                <div id="nameplate-5"></div>
                <button id="video-pause-5">Pause</button>
                <button id="video-resume-5">Resume</button>
              </div>
              <div id="tile-6" style={{ display: "none" }}>
                <video id="video-6" className="w-100 h-100"></video>
                <div id="nameplate-6"></div>
                <button id="video-pause-6">Pause</button>
                <button id="video-resume-6">Resume</button>
              </div>
              <div id="tile-7" style={{ display: "none" }}>
                <video id="video-7" className="w-100 h-100"></video>
                <div id="nameplate-7"></div>
                <button id="video-pause-7">Pause</button>
                <button id="video-resume-7">Resume</button>
              </div>
              <div id="tile-8" style={{ display: "none" }}>
                <video id="video-8" className="w-100 h-100"></video>
                <div id="nameplate-8"></div>
                <button id="video-pause-8">Pause</button>
                <button id="video-resume-8">Resume</button>
              </div>
              <div id="tile-9" style={{ display: "none" }}>
                <video id="video-9" className="w-100 h-100"></video>
                <div id="nameplate-9"></div>
                <button id="video-pause-9">Pause</button>
                <button id="video-resume-9">Resume</button>
              </div>
              <div id="tile-10" style={{ display: "none" }}>
                <video id="video-10" className="w-100 h-100"></video>
                <div id="nameplate-10"></div>
                <button id="video-pause-10">Pause</button>
                <button id="video-resume-10">Resume</button>
              </div>
              <div id="tile-11" style={{ display: "none" }}>
                <video id="video-11" className="w-100 h-100"></video>
                <div id="nameplate-11"></div>
                <button id="video-pause-11">Pause</button>
                <button id="video-resume-11">Resume</button>
              </div>
              <div id="tile-12" style={{ display: "none" }}>
                <video id="video-12" className="w-100 h-100"></video>
                <div id="nameplate-12"></div>
                <button id="video-pause-12">Pause</button>
                <button id="video-resume-12">Resume</button>
              </div>
              <div id="tile-13" style={{ display: "none" }}>
                <video id="video-13" className="w-100 h-100"></video>
                <div id="nameplate-13"></div>
                <button id="video-pause-13">Pause</button>
                <button id="video-resume-13">Resume</button>
              </div>
              <div id="tile-14" style={{ display: "none" }}>
                <video id="video-14" className="w-100 h-100"></video>
                <div id="nameplate-14"></div>
                <button id="video-pause-14">Pause</button>
                <button id="video-resume-14">Resume</button>
              </div>
              <div id="tile-15" style={{ display: "none" }}>
                <video id="video-15" className="w-100 h-100"></video>
                <div id="nameplate-15"></div>
                <button id="video-pause-15">Pause</button>
                <button id="video-resume-15">Resume</button>
              </div>
              <div id="tile-16" style={{ display: "none" }}>
                <video id="video-16" className="w-100 h-100"></video>
                <div id="nameplate-16"></div>
                <button id="video-pause-16" className="btn">
                  Pause
              </button>
                <button id="video-resume-16" className="btn">
                  Resume
              </button>
              </div>
              <div
                id="tile-17"
                className="screenview unselectable"
                style={{ resize: "both", display: "none" }}
              >
                <div id="nameplate-17" style={{ display: "none" }}>
                  No one is sharing screen
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default InMeeting;

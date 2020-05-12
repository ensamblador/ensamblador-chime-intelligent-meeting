import React, { useState, useEffect } from "react";

const Devices = (props) => {

  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done === false) {
      props.initDevices()
      setDone(true)
    }
  }, [done, props])

  return (<div id="flow-devices" className="flow">
    <div className="container">
      <form id="form-devices" onSubmit={props.formSubmit}>
        <h1 className="h3 mb-3 font-weight-normal text-center">Select devices</h1>
        <div className="row mt-3">
          <div className="col-8">
            <label htmlFor="audio-input">Microphone</label>
            <select
              id="audio-input"
              className="custom-select"
              style={{ width: "308px" }}
              onChange={props.MC.audioInputChange}
            ></select>
          </div>
          <div className="text-center col-4">
            <label>Preview</label>
            <div className="w-100 progress" style={{ marginTop: "0.75rem" }}>
              <div
                id="audio-preview"
                className="progress-bar bg-success"
                role="progressbar"
                aria-valuenow="0"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-8">
            <label htmlFor="video-input">Camera</label>
            <select
              id="video-input"
              onChange={props.MC.videoInputChange}
              className="custom-select"
              style={{ width: "308px" }}
            ></select>
          </div>
          <div className="col-4 text-center" style={{ width: "137px", height: "82px" }}>
            <video
              id="video-preview"
              className="w-100 h-100"
              style={{ maxWidth: "137px", maxHeight: "82px", borderRadius: "8px" }}
            ></video>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-8">
            <select defaultValue="540p"
              id="video-input-quality"
              onChange={props.MC.videoInputQualityChange}
              className="custom-select"
              style={{ width: "308px" }}
            >
              <option value="360p">360p (nHD) @ 15 fps (600 Kbps max)</option>
              <option value="540p">
                540p (qHD) @ 15 fps (1.4 Mbps max)
              </option>
              <option value="720p">720p (HD) @ 15 fps (1.4 Mbps max)</option>
            </select>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-8">
            <label htmlFor="audio-output">Speaker</label>
            <select
              id="audio-output"
              onChange={props.MC.audioOutputChange}
              className="custom-select"
              style={{ width: "308px" }}
            ></select>
          </div>
          {/*           <div className="col-4">
            <button
              id="button-test-sound"
              className="btn btn-outline-secondary btn-block h-50"
              style={{ marginTop: "2rem" }}
            >
              Test
            </button>
          </div> */}
        </div>
        <div className="row mt-3">
          <div className="col-lg">
            <button
              id="joinButton"
              className="btn btn-lg btn-primary btn-block"
              type="submit"
            >
              Join
            </button>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-lg">
            <p>
              Ready to join meeting{" "}
              <b>
                <span id="info-meeting">
                  {props.meeting}
                </span>
              </b>{" "}
              as{" "}
              <b>
                <span id="info-name">{props.name}</span>
              </b>
              .
            </p>
          </div>
        </div>
      </form>
      <div id="progress-join" className="w-100 progress progress-hidden">
        <div
          className="w-100 progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
    <div
      className="text-muted"
      style={{ position: "fixed", left: "3px", bottom: "3px" }}
      id="video-uplink-bandwidth"
    ></div>
    <div
      className="text-muted"
      style={{ position: "fixed", right: "3px", bottom: "3px" }}
      id="video-downlink-bandwidth"
    ></div>
  </div>)
}
export default Devices

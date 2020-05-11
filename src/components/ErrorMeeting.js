import React from "react";

const ErrorMeeting = (props) => (
  <div id="flow-failed-meeting" className="flow">
    <div className="container">
      <form id="form-failed-meeting">
        <div className="card border-warning mb-3" style={{ maxWidth: "20rem" }}>
          <div id="failed-meeting" className="card-header">
            Meeting ID: {props.meeting}
          </div>
          <div className="card-body">
            <h4 className="card-title">
              Unable to find meeting {props.meeting}
            </h4>
            <p className="card-text">
              There was an issue finding that meeting. The meeting may have
              already ended, or your authorization may have expired.
            </p>
            <small id="failed-meeting-error" className="text-muted">
              {props.error}
            </small>
          </div>
        </div>
        <button
          className="btn btn-lg btn-outline-warning btn-block"
          type="submit"
        >
          OK
        </button>
      </form>
    </div>
  </div>
);

export default ErrorMeeting;

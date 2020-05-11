import React from "react"



const StartMeeting =  (props) =>
    <div id="flow-authenticate" className="flow text-center">
      <div
        className="text-muted"
        style={{ position: "fixed", right: "3px", bottom: "3px" }}
        id="sdk-version"
      ></div>
      <div className="container">
        <form id="form-authenticate" onSubmit={props.formSubmit}>
          <h1 className="h3 mb-3 font-weight-normal">Unirse a reunión</h1>
          <div className="row mt-3">
            <label htmlFor="inputMeeting" className="sr-only">
              ID Reunión
            </label>
  
              <input
                type="name"
                onChange={props.inputChange}
                defaultValue={props.meeting}
                id="inputMeeting"
                className="htmlForm-control"
                placeholder="Meeting ID"
                required
                autoFocus
              />
          </div>
          <div className="row mt-3">
            <label htmlFor="inputName" className="sr-only">
              Nombre
            </label>
            <input
              onChange={props.inputChange}
              type="name"
              defaultValue={props.name}
              id="inputName"
              className="htmlForm-control"
              placeholder="Your Name"
              required
            />
          </div>
          <div className="row mt-3">
            <label htmlFor="inputRegion" className="sr-only">
              Media Region
            </label>
            <select
              id="inputRegion"
              onChange={props.inputChange}
              defaultValue="us-east-1"
              className="custom-select"
              style={{ width: "100%" }}
            >
              <option value="us-east-1">United States (N. Virginia)</option>
              <option value="ap-northeast-1">Japan (Tokyo)</option>
              <option value="ap-southeast-1">Singapore</option>
              <option value="ap-southeast-2">Australia (Sydney)</option>
              <option value="ca-central-1">Canada</option>
              <option value="eu-central-1">Germany (Frankfurt)</option>
              <option value="eu-north-1">Sweden (Stockholm)</option>
              <option value="eu-west-1">Ireland</option>
              <option value="eu-west-2">United Kingdom (London)</option>
              <option value="eu-west-3">France (Paris)</option>
              <option value="sa-east-1">Brazil (São Paulo)</option>
              <option value="us-east-2">United States (Ohio)</option>
              <option value="us-west-1">
                United States (N. CalihtmlFornia)
              </option>
              <option value="us-west-2">United States (Oregon)</option>
            </select>
          </div>
          <div className="row mt-3">
            <button
              id="authenticate"
              className="btn btn-lg btn-primary btn-block"
              type="submit"
            >
              Continuar
            </button>
          </div>
          <div className="row mt-3">
            <p>Cualquiera que tenga el link a la reunión puede entrar</p>
          </div>
          <div className="row mt-3">
            <div
              id="progress-authenticate"
              style={{ visibility: "visible" }}
              className="w-100 progress progress-hidden"
            >
              <div
                className="w-100 progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                aria-valuenow="100"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </form>
      </div>
    </div>



export default StartMeeting
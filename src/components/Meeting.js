import React, { useState } from "react"
import StartMeeting from "./StartMeeting.js"
import ErrorMeeting from "./ErrorMeeting.js"
import Devices from "./Devices.js"
import InMeeting from "./InMeeting.js"
import MeetingClass from './MeetingClass'



const MC = new MeetingClass()

const Meeting = (props) => {
  const [meeting, setMeeting] = useState(new URL(window.location.href).searchParams.get("m"))
  const [name, setName] = useState(new URL(window.location.href).searchParams.get("name"))

  let defaultRegion = new URL(window.location.href).searchParams.get("region")
  if (defaultRegion == null) defaultRegion = "us-east-1"

  const [region, setRegion] = useState(defaultRegion)
  const [error, setError] = useState()
  const [meetingId, setMeetingId] = useState({ message: "" })

  const [flow, setFlow] = useState("flow-authenticate")
  MC.setEndpoint(props.endpoint)
  MC.setFlow = setFlow

  const initDevices = async () => {
    await MC.initializeDevices()
    const url = new URL(window.location.href)
    url.searchParams.set("m", meeting)
    window.history.replaceState({}, `${meeting}`, url.toString())
  }

  const initMeeting = async () => {
    try {
      await MC.finishJoin()
    } catch (error) {
      document.getElementById('failed-join').innerHTML = `Meeting ID: ${meeting}`;
      document.getElementById('failed-join-error').innerHTML = `Error: ${error.message}`;
    }
  }

  const inputChange = (e) => {
    switch (e.target.id) {
      case "inputMeeting":
        setMeeting(e.target.value)
        break
      case "inputName":
        setName(e.target.value)
        break
      case "inputRegion":
        setRegion(e.target.value)
        break
      default:
        break
    }
  }

  const formSubmit = async (e) => {
    e.preventDefault()
    try {
      setMeetingId(await MC.authenticate(meeting, name, region))
      await MC.initializeMeetingSession()
    } catch (error) {
      console.log(error)
      setError(error.message)
      setFlow("flow-failed-meeting")
      return
    }
    setFlow("flow-devices")
  }

  const formDevicesSubmit = async (e) => {
    e.preventDefault()
    await MC.startJoining()
    setFlow('flow-meeting');
  }

  switch (flow) {
    case "flow-authenticate":
      return (
        <StartMeeting
          meeting={meeting}
          name={name}
          formSubmit={formSubmit}
          inputChange={inputChange}
        />
      )
    case "flow-failed-meeting":
      return <ErrorMeeting meeting={meeting} error={error} />
    case "flow-devices":
      return (
        <Devices
          meetingId={meetingId}
          meeting={meeting}
          region={region}
          name={name}
          formSubmit={formDevicesSubmit}
          initDevices={initDevices}
          MC = {MC}
        />
      )
    case "flow-meeting":
      return (
        <InMeeting
          meetingId={meetingId}
          meeting={meeting}
          region={region}
          name={name}
          initMeeting={initMeeting}
          MC = {MC}
        />
      )
    default:
      return <div />
  }
}
export default Meeting

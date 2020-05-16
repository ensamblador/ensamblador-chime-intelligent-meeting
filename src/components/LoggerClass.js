import gql from 'graphql-tag'
//import { getMeeting } from '../graphql/queries'
import { createMeeting, createAtendee, createComment } from '../graphql/mutations'
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import awsconfig from '../aws-exports'


//const GET_MEETING = gql(getMeeting)
const CREATE_MEETING = gql(createMeeting)
const CREATE_ATTENDEE = gql(createAtendee)
const CREATE_COMMENT = gql(createComment) 


export default class Logger {

    constructor() {
        this.MeetingId = null
        this.AttendeeId = null
        this.client = new AWSAppSyncClient({
            url: awsconfig.aws_appsync_graphqlEndpoint,
            region: awsconfig.aws_appsync_region,
            auth: {
                type: AUTH_TYPE.API_KEY,
                apiKey: awsconfig.aws_appsync_apiKey,
            }
        })
    }

    joined = (Meeting, Atendee) => {
        this.MeetingId = Meeting.MeetingId
        this.AttendeeId = Atendee.AttendeeId
        this.createMeeting(Meeting)
        this.createAttendee(Atendee)
        this.createComment('[Join]')

    }
    leave = () => {
        if (this.MeetingId) this.createComment('[Leave]')
    }
    end = () => {
        if (this.MeetingId) this.createComment('[End]')
    }

    createAttendee = (aAttendee) => {
        let chimeAtendeeId = aAttendee.ExternalUserId.split("#")[1]
        this.client.mutate({
            mutation: CREATE_ATTENDEE,
            variables: {
                input: {
                    id: aAttendee.AttendeeId,
                    meetingAlias: chimeAtendeeId,
                    atendeeMeetingsId:  this.MeetingId
                }
            }
        }).then(({ data: { createAtendee } }) => {
            console.log(createAtendee)
        }).catch(err => {
        //aca puede ser que la meeting esté creada.    
            console.log(err)
        })
    }

    createMeeting = (aMeeting) => {
        this.client.mutate({
            mutation: CREATE_MEETING,
            variables: {
                input: {
                    id: aMeeting.MeetingId,
                    meetingChimeId: aMeeting.ExternalMeetingId
                }
            }
        }).then(({ data: { createMeeting } }) => {

        }).catch(err => {
        //aca puede ser que la meeting esté creada.    
            console.log(err)
        })
    }

    createComment = (comment) => {
        this.client.mutate({
            mutation: CREATE_COMMENT,
            variables: {
                input: {
                    commentAtendeeId: this.AttendeeId,
                    commentMeetingId: this.MeetingId,
                    content: comment
                }
            }
        }).then(({ data: { createComment } }) => {
            console.log(`Comentario ${createComment.id} insertado content: ${comment}`)
        }).catch(err => {
        //aca puede ser que la meeting esté creada.    
            console.log(err)
        })
    }

}
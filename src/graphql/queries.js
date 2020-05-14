/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getMeeting = /* GraphQL */ `
  query GetMeeting($id: ID!) {
    getMeeting(id: $id) {
      id
      meetingChimeId
      atendees {
        items {
          id
          meetingAlias
          createdAt
        }
        nextToken
      }
      comments {
        items {
          id
          content
          sentiment
          entities
          keyPhrases
          createdAt
        }
        nextToken
      }
      createdAt
    }
  }
`;
export const listMeetings = /* GraphQL */ `
  query ListMeetings(
    $filter: ModelMeetingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMeetings(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        meetingChimeId
        atendees {
          nextToken
        }
        comments {
          nextToken
        }
        createdAt
      }
      nextToken
    }
  }
`;
export const getAtendee = /* GraphQL */ `
  query GetAtendee($id: ID!) {
    getAtendee(id: $id) {
      id
      meetingAlias
      meetings {
        id
        meetingChimeId
        atendees {
          nextToken
        }
        comments {
          nextToken
        }
        createdAt
      }
      comments {
        items {
          id
          content
          sentiment
          entities
          keyPhrases
          createdAt
        }
        nextToken
      }
      createdAt
    }
  }
`;
export const listAtendees = /* GraphQL */ `
  query ListAtendees(
    $filter: ModelAtendeeFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAtendees(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        meetingAlias
        meetings {
          id
          meetingChimeId
          createdAt
        }
        comments {
          nextToken
        }
        createdAt
      }
      nextToken
    }
  }
`;
export const getComment = /* GraphQL */ `
  query GetComment($id: ID!) {
    getComment(id: $id) {
      id
      content
      atendee {
        id
        meetingAlias
        meetings {
          id
          meetingChimeId
          createdAt
        }
        comments {
          nextToken
        }
        createdAt
      }
      meeting {
        id
        meetingChimeId
        atendees {
          nextToken
        }
        comments {
          nextToken
        }
        createdAt
      }
      sentiment
      entities
      keyPhrases
      createdAt
    }
  }
`;
export const listComments = /* GraphQL */ `
  query ListComments(
    $filter: ModelCommentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listComments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        content
        atendee {
          id
          meetingAlias
          createdAt
        }
        meeting {
          id
          meetingChimeId
          createdAt
        }
        sentiment
        entities
        keyPhrases
        createdAt
      }
      nextToken
    }
  }
`;

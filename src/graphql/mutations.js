/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createMeeting = /* GraphQL */ `
  mutation CreateMeeting(
    $input: CreateMeetingInput!
    $condition: ModelMeetingConditionInput
  ) {
    createMeeting(input: $input, condition: $condition) {
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
          commentMeetingId
        }
        nextToken
      }
      createdAt
    }
  }
`;
export const updateMeeting = /* GraphQL */ `
  mutation UpdateMeeting(
    $input: UpdateMeetingInput!
    $condition: ModelMeetingConditionInput
  ) {
    updateMeeting(input: $input, condition: $condition) {
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
          commentMeetingId
        }
        nextToken
      }
      createdAt
    }
  }
`;
export const deleteMeeting = /* GraphQL */ `
  mutation DeleteMeeting(
    $input: DeleteMeetingInput!
    $condition: ModelMeetingConditionInput
  ) {
    deleteMeeting(input: $input, condition: $condition) {
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
          commentMeetingId
        }
        nextToken
      }
      createdAt
    }
  }
`;
export const createAtendee = /* GraphQL */ `
  mutation CreateAtendee(
    $input: CreateAtendeeInput!
    $condition: ModelAtendeeConditionInput
  ) {
    createAtendee(input: $input, condition: $condition) {
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
          commentMeetingId
        }
        nextToken
      }
      createdAt
    }
  }
`;
export const updateAtendee = /* GraphQL */ `
  mutation UpdateAtendee(
    $input: UpdateAtendeeInput!
    $condition: ModelAtendeeConditionInput
  ) {
    updateAtendee(input: $input, condition: $condition) {
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
          commentMeetingId
        }
        nextToken
      }
      createdAt
    }
  }
`;
export const deleteAtendee = /* GraphQL */ `
  mutation DeleteAtendee(
    $input: DeleteAtendeeInput!
    $condition: ModelAtendeeConditionInput
  ) {
    deleteAtendee(input: $input, condition: $condition) {
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
          commentMeetingId
        }
        nextToken
      }
      createdAt
    }
  }
`;
export const createComment = /* GraphQL */ `
  mutation CreateComment(
    $input: CreateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    createComment(input: $input, condition: $condition) {
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
      commentMeetingId
    }
  }
`;
export const updateComment = /* GraphQL */ `
  mutation UpdateComment(
    $input: UpdateCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    updateComment(input: $input, condition: $condition) {
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
      commentMeetingId
    }
  }
`;
export const deleteComment = /* GraphQL */ `
  mutation DeleteComment(
    $input: DeleteCommentInput!
    $condition: ModelCommentConditionInput
  ) {
    deleteComment(input: $input, condition: $condition) {
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
      commentMeetingId
    }
  }
`;

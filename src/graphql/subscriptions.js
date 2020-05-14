/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateMeeting = /* GraphQL */ `
  subscription OnCreateMeeting {
    onCreateMeeting {
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
export const onUpdateMeeting = /* GraphQL */ `
  subscription OnUpdateMeeting {
    onUpdateMeeting {
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
export const onDeleteMeeting = /* GraphQL */ `
  subscription OnDeleteMeeting {
    onDeleteMeeting {
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
export const onCreateAtendee = /* GraphQL */ `
  subscription OnCreateAtendee {
    onCreateAtendee {
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
export const onUpdateAtendee = /* GraphQL */ `
  subscription OnUpdateAtendee {
    onUpdateAtendee {
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
export const onDeleteAtendee = /* GraphQL */ `
  subscription OnDeleteAtendee {
    onDeleteAtendee {
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
export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment {
    onCreateComment {
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
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment {
    onUpdateComment {
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
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment {
    onDeleteComment {
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

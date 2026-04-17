export const onCreateMessages = `
  subscription OnCreateMessages($filter: ModelSubscriptionMessagesFilterInput) {
    onCreateMessages(filter: $filter) {
      content
      conversation {
        conversationId
        createdAt
        feature
        title
        updatedAt
        userId
        __typename
      }
      conversationId
      createdAt
      messageId
      model {
        applicationSupport
        createdAt
        modelId
        modelName
        providerId
        providerSupport
        status
        updatedAt
        __typename
      }
      modelId
      role
      timestamp
      updatedAt
      __typename
    }
  }
`;

export const getProviders = `
  query ListGPTProviders {
    listGptProviders(filter: {status: {eq: ACTIVE}}) {
      items {
      providerId
      providerName
    }
  }
}
`;

export const getModels = `
  query listProviderModels {
  listProviderModels(
    filter: {status: {eq: ACTIVE}, applicationSupport: {eq: true}}
  ) {
    items {
      modelId
      modelName
      modelType
      providerId
      status
      label {
        label
      }
      provider {
        providerName
        showLabel
      }
    }
  }
}
`;

export const addModels = `
  mutation CreateUserProviderConfig(
  $condition: ModelUserProviderConfigConditionInput
  $input: CreateUserProviderConfigInput!
) {
  createUserProviderConfig(condition: $condition, input: $input) {
    apiKey
    createdAt
    gptProviders {
      createdAt
      providerId
      providerName
      status
      updatedAt
      __typename
    }
    providerId
    updatedAt
    user {
      accountId
      authenticationType
      createdAt
      email
      firstName
      lastName
      phone
      signupStatus
      updatedAt
      userId
      __typename
    }
    userId
    userProviderConfigId
    __typename
  }
}
`;

export const deleteUserProviderConfig = `
 mutation DeleteProviderConfig($userProviderConfigId: ID!) { 
    deleteUserProviderConfig(input: {userProviderConfigId: $userProviderConfigId}) { 
      userProviderConfigId 
      userId 
    } 
  }
`;

export const getUserProviderConfigs = `
  query ListConfigs($userId: ID!) {
    listUserProviderConfigByUserId(userId: $userId) {
       items {
      apiKey
      userProviderConfigId
      userId
      gptProviders {
        providerId
        providerName
      }
    }
    }
  }
`;

export const editUserProviderConfig = `
  mutation editUserProviderConfig($apiKey: String!, $providerId: ID!, $userId: ID!, $userProviderConfigId: ID!) {
    editUserProviderConfig(
      apiKey: $apiKey
      providerId: $providerId
      userId: $userId
      userProviderConfigId: $userProviderConfigId
    ) {
      data
      message
      statusCode
    }
  }
`;

export const fetchUserProviderConfigs = `
  mutation fetchUserProviderConfigs($userId: ID!) {
    fetchUserProviderConfigs(userId: $userId) {
      data
      message
      statusCode
    }
  }
`;

export const listUserModelPriorities = `
  query listUserModelPriorities($eq: ID!) {
    listUserModelPriorities(filter: { userId: { eq: $eq } }) {
      items {
        models
        id
        feature
        userId
      }
    }
  }
`;

export const createUserModelPriority = `
   mutation createUserModelPriority($models: [AWSJSON!]!, $userId: String!, $feature: CreateUserModelPriorityFeature!) {
    createUserModelPriority(models: $models, userId: $userId, feature: $feature) {
      feature
      id
      models
      userId
    }
  }
`;
export const updateUsersQuery = `
  mutation updateUsers(
    $userId: ID!
    $phone: String
    $lastName: String
    $firstName: String
    $isNewUser: Boolean
  ) {
    updateUsers(
      input: {
        userId: $userId
        firstName: $firstName
        lastName: $lastName
        phone: $phone
        isNewUser: $isNewUser
      }
    ) {
      email
      firstName
      lastName
      phone
      userId
      isNewUser
    }
  }
`;

export const editUsersQuery = `
  mutation UpdateUser(
    $userId: ID!
    $firstName: String
    $lastName: String
    $phone: String
    $signupStatus: UsersSignupStatus
    $authenticationType: UsersAuthenticationType
  ) {
    updateUsers(
      input: {
        userId: $userId
        firstName: $firstName
        lastName: $lastName
        phone: $phone
        signupStatus: $signupStatus
        authenticationType: $authenticationType
      }
    ) {
      userId
      updatedAt
      signupStatus
      phone
      lastName
      firstName
      accountId
      authenticationType
      email
      createdAt
    }
  }
`;

export const getUsersQuery = `
  query getUsers($userId: ID!) {
    getUsers(userId: $userId) {
      userId
      updatedAt
      signupStatus
      phone
      lastName
      firstName
      email
      createdAt
      authenticationType
      accountId
      isNewUser
    }
  }
`;
export const deleteUserModelPriorities = `
  mutation DeleteUserModelPrioritiesByUserId($userId: ID!) {
    deleteUserModelPrioritiesByUserId(userId: $userId) {
      data
      errorType
      isError
      message
      statusCode
      __typename
    }
  }
`;
export const createConversationsQuery = `
  mutation createConversations($conversationId: ID!, $title: String, $userId: ID!, $feature: ConversationsFeature) {
    createConversations(
      input: {conversationId: $conversationId, userId: $userId, title: $title, feature: $feature}
    ) {
      conversationId
      feature
      title
      userId
    }
  }
`;
export const listConversationsByUserIdQuery = `
  query listConversationsByUserId($userId: ID!) {
    listConversationsByUserId(userId: $userId) {
      items {
        conversationId
        createdAt
        feature
        title
        updatedAt
        userId
      }
    }
  }
`;
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessagesFilterInput
    $limit: Int
    $messageId: ID
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listMessages(
      filter: $filter
      limit: $limit
      messageId: $messageId
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        attachments
        content
        conversationId
        createdAt
        messageId
        modelId
        feature
        role
        timestamp
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const createUserMessage = /* GraphQL */ `
  mutation CreateUserMessage(
    $content: String!
    $conversationId: ID!
    $messageId: ID!
    $modelId: ID!
    $role: CreateUserMessageRole
  ) {
    createUserMessage(
      content: $content
      conversationId: $conversationId
      messageId: $messageId
      modelId: $modelId
      role: $role
    ) {
      data
      errorType
      isError
      message
      statusCode
      __typename
    }
  }
`;
export const getAppStatus = `
  query MyQuery {
    listAppConfigStatuses {
      items {
        appStatus
        id
      }
    }
  }
`;

export const getConversations = /* GraphQL */ `
  query GetConversations($conversationId: ID!) {
    getConversations(conversationId: $conversationId) {
      conversationId
      createdAt
      feature
      messages {
        nextToken
        __typename
      }
      title
      updatedAt
      userId
      __typename
    }
  }
`;

export const listPlans = /* GraphQL */ `
  query ListPlans {
    listPlans {
      items {
        planId
        planName
        description
        price
        planType
        category
        planDuration
        features
        displayTag
        status
        createdAt
        updatedAt
        isSubPlan
        subPlan
        timestamp
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const updateUsers = /* GraphQL */ `
  mutation UpdateUsers(
    $condition: ModelUsersConditionInput
    $input: UpdateUsersInput!
  ) {
    updateUsers(condition: $condition, input: $input) {
      account {
        accountStatus
        accountType
        __typename
      }
      accountId
      authenticationType
      country {
        countryName
        currency
        dialCode
        isoCode
        status
      }
      email
      firstName
      isNewUser
      lastName
      phone
      signupStatus
      userId
    }
  }
`;

export const listPlansByCountryId = `query listPlansByCountryId(
$countryId: ID!
$filter: ModelplansFilterInput) {
  listPlansByCountryId(
  countryId: $countryId
  filter: $filter) {
    items {
      businessCode
      category
      countryId
      createdAt
      description
      displayTag
      externalPlanId
      features
      isSubPlan
      paymentProviderId
      planDuration
      planId
      planName
      planType
      price
      priority
      status
      subPlan
      timestamp
      updatedAt
      country {
        countryId
        countryName
        createdAt
        currency
        dialCode
        isoCode
        status
      }
    }
  }
}`;

export const listUserSubscriptionsByUserId = /* GraphQL */ `
  query listUserSubscriptionsByUserId(
    $userId: ID!
    $filter: ModeluserSubscriptionsFilterInput
  ) {
    listUserSubscriptionsByUserId(userId: $userId, filter: $filter) {
      items {
        createdAt
        endDate
        paymentInfoId
        planId
        startDate
        status
        timestamp
        updatedAt
        userId
        userSubscriptionId
        plan {
          externalPlanId
          displayTag
          description
          category
          planId
          planName
          planType
          price
          priority
          status
          features
        }
        paymentInformation {
          wallet
          vpa
          userId
          updatedAt
          totalPrice
          status
          tax
          platformFee
          paymentInfoId
          notes
          orderId
          method
          email
          currency
          createdAt
          contact
          card
          captured
          amount
          bank
        }
      }
    }
  }
`;

export const createUserSubscriptions = /* GraphQL */ `
  mutation CreateUserSubscriptions(
    $condition: ModelUserSubscriptionsConditionInput
    $input: CreateUserSubscriptionsInput!
  ) {
    createUserSubscriptions(condition: $condition, input: $input) {
      createdAt
      endDate
      paymentInfoId
      paymentInformation {
        amount
        bank
        captured
        card
        contact
        createdAt
        currency
        email
        method
        notes
        orderId
        paymentInfoId
        platformFee
        status
        tax
        totalPrice
        updatedAt
        userId
        vpa
        wallet
        __typename
      }
      plan {
        businessCode
        category
        countryId
        description
        displayTag
        externalPlanId
        features
        isSubPlan
        paymentProviderId
        planDuration
        planName
        planType
        price
        priority
        status
        subPlan
        timestamp
        __typename
      }
      planId
      startDate
      status
      subscriptionHistory {
        nextToken
        __typename
      }
      timestamp
      updatedAt
      user {
        authenticationType
        countryId
        createdAt
        email
        firstName
        isNewUser
        lastName
        phone
        signupStatus
        updatedAt
        userId
        __typename
      }
      userId
      userSubscriptionId
      __typename
    }
  }
`;

export const createUserPreferences = /* GraphQL */ `
  mutation CreateUserPreferences(
    $condition: ModelUserPreferencesConditionInput
    $input: CreateUserPreferencesInput!
  ) {
    createUserPreferences(condition: $condition, input: $input) {
      createdAt
      interests
      rOwner
      rdOwner
      role
      ruOwner
      rwOwner
      tenantId
      timestamp
      updatedAt
      usecases
      user {
        authenticationType
        countryId
        email
        firstName
        isNewUser
        lastName
        phone
        rOwner
        rdOwner
        ruOwner
        rwOwner
        signupStatus
        tenantId
        __typename
      }
      userId
      userPreferencesId
      __typename
    }
  }
`;

export const updateUserPreferences = /* GraphQL */ `
  mutation UpdateUserPreferences(
    $condition: ModelUserPreferencesConditionInput
    $input: UpdateUserPreferencesInput!
  ) {
    updateUserPreferences(condition: $condition, input: $input) {
      createdAt
      interests
      rOwner
      rdOwner
      role
      ruOwner
      rwOwner
      tenantId
      timestamp
      updatedAt
      usecases
      user {
        authenticationType
        countryId
        email
        firstName
        isNewUser
        lastName
        phone
        rOwner
        rdOwner
        ruOwner
        rwOwner
        signupStatus
        tenantId
        __typename
      }
      userId
      userPreferencesId
      __typename
    }
  }
`;

export const createAnswers = /* GraphQL */ `
  mutation CreateAnswers(
    $condition: ModelAnswersConditionInput
    $input: CreateAnswersInput!
  ) {
    createAnswers(condition: $condition, input: $input) {
      answerId
      answerValue
      answeredBy {
        authenticationType
        countryId
        email
        firstName
        isNewUser
        lastName
        phone
        rOwner
        rdOwner
        ruOwner
        rwOwner
        signupStatus
        tenantId
        __typename
      }
      createdAt
      form {
        rOwner
        rdOwner
        ruOwner
        rwOwner
        tenantId
        timestamp
        title
        userId
        __typename
      }
      formId
      question {
        furtherSuggestions
        options
        questionText
        questionType
        __typename
      }
      questionId
      rOwner
      rdOwner
      ruOwner
      rwOwner
      tenantId
      updatedAt
      userId
      __typename
    }
  }
`;
export const createUserModelPriorities = /* GraphQL */ `
  mutation CreateUserModelPriorities(
    $condition: ModelUserModelPrioritiesConditionInput
    $input: CreateUserModelPrioritiesInput!
  ) {
    createUserModelPriorities(condition: $condition, input: $input) {
      createdAt
      feature
      id
      models
      rOwner
      rdOwner
      ruOwner
      rwOwner
      tenantId
      updatedAt
      userId
      __typename
    }
  }
`;

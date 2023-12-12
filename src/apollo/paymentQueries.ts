import { gql } from "@apollo/client";

export const CreateClientPaymentSubscription =
  gql(`mutation CreateClientPaymentSubscription(
    $createdBy: String!
    $paymentSubscription: ClientPaymentSubscriptionInput!
  ) {
    payments {
      createClientPaymentSubscription(
        createdBy: $createdBy
        paymentSubscription: $paymentSubscription
      ) {
        clientSecret
        paymentKey
      }
    }
  }
`);

export const CreateClientFullPayment = gql(`mutation CreateClientFullPayment(
    $createdBy: String!
    $paymentInput: ClientFullPaymentInput!
  ) {
    payments {
      createClientFullPayment(
        createdBy: $createdBy
        paymentInput: $paymentInput
      ) {
        clientSecret
        paymentKey
      }
    }
  }
`);



export const CreateUserPaymentSubscription =
  gql(`mutation CreateUserPaymentSubscription($stripePriceId: String!, $userId: String!) {
    payments {
      createUserPaymentSubscription(
        paymentSubscription: { userId: $userId, stripePriceId: $stripePriceId }
      )
    }
  }  
`);

export const GetClientPaymentsByOrderId =
  gql(`query GetClientPaymentsByOrderId ($orderId: String!) {
  payments {
    lookupClientPaymentsByOrder(orderId: $orderId) {
    amount
      clientId
      createdAt
      createdBy
      currency
      failCode
      failDeclineCode
      failMessage
      failedAt
      id
      orderId
      paidAt
      status
      subscriptionId
    }
  }
}
`);

export const CreateClientCustomPayment = gql(`mutation CreateClientCustomPayment(
    $createdBy: String!
    $customPayment: CustomPaymentInput!
  ) {
    payments {
      createClientCustomPayment(
        createdBy: $createdBy
        customPayment: $customPayment
      )
      {
      paymentIntentKeys {
        clientSecret
        paymentKey
      }
    }
    }
  }
`);

export const ChangePaymentMethod =
  gql(`mutation ChangePaymentMethod($change: ChangePaymentMethodInput!) {
    payments {
      changePaymentMethod(
        change:$change
      )
    }
  }  
`);
export const ChangeSubscriptionPlan =
  gql(`mutation ChangeSubscriptionPlan($priceId: String!, $userId: String!) {
    payments {
      changeSubscriptionPlan(
        priceId:$priceId
        userId:$userId
      )
    }
  }  
`);
export const CheckFreeTrialStatus =
  gql(`query CheckFreeTrialStatus($userId: String!) {
    payments {
      freeTrialStatus(
        userId:$userId
      )
    }
  }  
`);

export const CreateSquarePayment =
  gql(`mutation CreateSquarePayment($createdBy: String!, $detail: SquareClientOneTimePaymentInput!) {
    payments {
      squareClientOnetimePayment(
        createdBy:$createdBy
        detail:$detail
      )
    }
  }  
`);
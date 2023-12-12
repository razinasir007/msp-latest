import { gql } from "@apollo/client";

export const GetSubscriptionPlans = gql(`query GetSubscriptionPlans {
    payments {
      getSubscriptionPlans {
        id
        title
        description
        benefits
        currency
        cycleAmount
        intervalCount
        intervalUnit
      }
    }
  }  
`);

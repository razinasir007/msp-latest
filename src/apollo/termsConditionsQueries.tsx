import { gql } from "@apollo/client";

export const GetTermsConditions =
  gql(`query GetTermsConditions($orgId: String!) {
    termsAndConditions {
      lookupByOrg(orgId: $orgId) {
        id
        title
        type
        description
        orgId
        isRequired
      }
    }
  }`);

export const CreateTermsConditions =
  gql(`mutation CreateTermsConditions($createdBy: String!, $termAndCondition: TermAndConditionInput!) {
    termsAndConditions {
      create(createdBy: $createdBy, termAndCondition: $termAndCondition)
    }
  }
  `);

export const DeleteTermsConditions =
  gql(`mutation DeleteTermsConditions($id: String !) {
    termsAndConditions {
      delete(id: $id)
    }
  }
  `);

export const UpdateTermsConditions =
  gql(`mutation UpdateTermsConditions($updatedBy: String!, $termAndCondition: TermAndConditionInput !) {
    termsAndConditions {
      update(updatedBy: $updatedBy, termAndCondition: $termAndCondition)
    }
  }
  `);

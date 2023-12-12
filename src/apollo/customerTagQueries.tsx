import { gql } from "@apollo/client";

export const GetCustomerTags = gql(`query GetCustomerTags {
    clientTags {
      getClientTagDetails {
        sortingIndex
        orgId
        name
        id
        description
        createdAt
      }
    }
  }
`);

export const GetCustomerTagsByOrg = gql(`query GetCustomerTagsByOrg($orgId: String!) {
  clientTags {
    lookupClientTagDetailsByOrg(orgId: $orgId) {
      sortingIndex
      orgId
      name
      id
      description
      createdAt
    }
  }
}
`);

export const CreateCustomerTags = gql(`mutation CreateCustomerTags(
    $clientTagDetail: ClientTagDetailInput!
    $createdBy: String!
  ) {
    clientTags {
      createClientTagDetail(
        clientTagDetail: $clientTagDetail
        createdBy: $createdBy
      )
    }
  }
`);

export const UpdateCustomerTag = gql(`mutation UpdateCustomerTag(
  $clientTagDetail: ClientTagDetailInput!
  $updatedBy: String!
) {
  clientTags {
    updateClientTagDetail(
      clientTagDetail: $clientTagDetail
      updatedBy: $updatedBy
    )
  }
}
`);

export const DeleteCustomerTag = gql(`mutation DeleteCustomerTag($id: String!, $deletedBy: String!) {
  clientTags {
    deleteClientTagDetail(id: $id, deletedBy: $deletedBy)
  }
}
`);

export const UpdateTagsSortingIndex =
  gql(`mutation UpdateTagsSortingIndex($ids: [String!]!, $updatedBy: String!) {
  clientTags {
    updateClientTagDetailSortingIndex(ids: $ids, updatedBy: $updatedBy)
  }
}
`);

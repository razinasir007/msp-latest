import { gql } from "@apollo/client";

export const GetCustomerFields = gql(`query GetCustomerFields {
    clients {
      getClientFieldDetails {
        datatype
        id
        isRequired
        name
        orgId
        sortingIndex
      }
    }
  }
  `);

export const GetCustomerFieldsByOrg = gql(`query GetCustomerFieldsByOrg($orgId: String!) {
  clients {
    lookupClientFieldDetailsByOrg(orgId: $orgId) {
      orgId
      datatype
      id
      isRequired
      name
      sortingIndex
    }
  }
}
  `);

export const CreateCustomerField = gql(`mutation CreateCustomerField(
      $clientFieldDetail: ClientFieldDetailInput!
      $createdBy: String!
    ) {
      clients {
        createClientFieldDetail(
          clientFieldDetail: $clientFieldDetail
          createdBy: $createdBy
        )
      }
    }
  `);

export const UpdateCustomerField = gql(`mutation UpdateCustomerField(
    $clientFieldDetail: ClientFieldDetailInput!
    $updatedBy: String!
  ) {
    clients {
      updateClientFieldDetail(
        clientFieldDetail: $clientFieldDetail
        updatedBy: $updatedBy
      )
    }
  }
  `);

export const DeleteCustomerField = gql(`mutation DeleteCustomerField($id: String!, $deletedBy:String!) {
    clients {
      deleteClientFieldDetail(id: $id, deletedBy: $deletedBy)
    }
  }
  `);

export const UpdateFieldsSortingIndex = gql(`mutation UpdateFieldsSortingIndex(
    $ids: [String!]!
    $updatedBy: String!
    ) {
      clients {
        updateClientFieldDetailSortingIndex(
          ids: $ids
          updatedBy: $updatedBy
          )
        }
    }
    
  `);

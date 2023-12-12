import { gql } from "@apollo/client";

export const GetPackageByOrg = gql(`
query GetPackageByOrg($orgId: String!) {
    package {
      lookupByOrganization(orgId: $orgId) {
        id
        description
        name
        price
        sizes
      }
    }
  }
  `);

export const CreatePackageMutation = gql(`
mutation CreatePackage($createdBy: String!, $description: String!, $id: String!, $name: String!, $orgId: String!, $price: Int!, $sizes: [String!]!) {
    packages {
      createPackage(
        createdBy: $createdBy
        package: {id: $id, orgId: $orgId, name: $name, price: $price, description: $description}
        sizes: $sizes
      )
    }
  }
  `);

export const GetPackageSizes = gql(`
query GetPackageSizes {
    packageSizes {
      getPackageSizes {
        id
        size
      }
    }
  }
  `);

export const DeletePackage = gql(`
mutation DeletePackage($id: String!) {
    packages {
      deletePackage(id: $id)
    }
  }
  `);

export const UpdatePackage = gql(`
mutation UpdatePackage($id: String!, $name: String!, $orgId: String!, $price: Int!, $updatedBy: String!, $description: String!, $sizes: [String!]!) {
    packages {
      updatePackage(
        package: {id: $id, orgId: $orgId, name: $name, price: $price, description: $description}
        updatedBy: $updatedBy
        sizes: $sizes
      )
    }
  }
  `);

  export const CreateOrderPackagesMutation = gql(`
  mutation CreateOrderPackagesMutation($createdBy: String!, $orderItemPackages:[OrderItemPackageInput!]!, $sizes: [OrderItemPackageDetailInput!]!) {
    orderItemPackage {
      createOrderPackage(
        createdBy: $createdBy
        orderItemPackages:  $orderItemPackages
        sizes: $sizes
      )
    }
  }
  `);


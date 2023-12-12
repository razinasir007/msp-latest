import { gql } from "@apollo/client";

export const CreateProduct = gql(`mutation createProduct(
    $createdBy: String!
    $productDetail: ProductDetailInput!
  ) {
    productDetails {
      createProductDetail(createdBy: $createdBy, productDetail: $productDetail)
    }
  }
`);

export const UpdateProduct = gql(`mutation updateProduct(
    $updatedBy: String!
    $productDetail: ProductDetailInput!
  ) {
    productDetails {
      updateProductDetail(updatedBy: $updatedBy, productDetail: $productDetail)
    }
  }
`);

export const DeleteProduct = gql(`mutation deleteProduct($id: String!) {
  productDetails {
    deleteProductDetail(id: $id)
   }
 }
`);

export const GetProductDetailByOrgID =
  gql(`query getProductDetailByOrgID($orgId: String!) {
  productDetails {
    lookupProductDetailsByOrganization(orgId: $orgId) {
      description
      id
      isActive
      numberOfOptions
      flatPrice
      flatCost
      title
    }
  }
}
`);

export const GetReservedOptions = gql(`query getReservedOptions {
    productDetails {
      getProductDetailReservedOptions {
        name
        sortingIndex
        fields {
          ... on PDReservedOptionSizeField {
            cost
            price
            sortingIndex
            value
          }
          ... on PDReservedOptionFrameField {
            cost
            price
            sortingIndex
            value
            image
          }
          ... on PDReservedOptionMattingField {
            colorCode
            cost
            value
            price
            sortingIndex
          }
        }
      }
    }
  }  
`);

export const GetProductDetailsOptionsByProdID =
  gql(`query getProductDetailsOptionsByProdID($prodID: String!)  {
  productDetails {
    lookupProductDetail(id: $prodID) {
      regularOptions {
        id
        name
        sortingIndex
        fields {
          ... on ProductDetailOptionField {
            id
            cost
            price
            sortingIndex
            value
          }
        }
      }
      reservedOptions {
        id
        name
        sortingIndex
        fields {
          ... on ProductDetailOptionSizeField {
            id
            cost
            price
            sortingIndex
            value
          }
          ... on ProductDetailOptionFrameField {
            id
            cost
            image
            price
            sortingIndex
            value
          }
          ... on ProductDetailOptionMattingField {
            id
            colorCode
            cost
            price
            sortingIndex
            value
          }
        }
      }
    }
  }
}
`);

//Same query as GetProductDetailByOrgID but with reserved and regular options
export const GetProductDetailWithOptionsByOrgID =
  gql(`query getProductDetailByOrgIDandOption($orgId: String!) {
  productDetails {
    lookupProductDetailsByOrganization(orgId: $orgId) {
      description
      id
      isActive
      numberOfOptions
      flatPrice
      flatCost
      title
      regularOptions {
        id
        name
        sortingIndex
        regularFields {
          ... on ProductDetailOptionField {
            id
            sortingIndex
            value
            price
            cost
          }
        }
      }
      reservedOptions {
        id
        name
        sortingIndex
        reservedFields {
          ... on ProductDetailOptionSizeField {
            id
            sortingIndex
            price
            cost
            value
          }
          ... on ProductDetailOptionFrameField {
            id
            image
            price
            cost
            sortingIndex
            value
          }
          ... on ProductDetailOptionMattingField {
            id
            price
            colorCode
            cost
            sortingIndex
            value
          }
        }
      }
    }
  }
}
`);

export const CreateActualProduct = gql(`mutation CreateActualProduct(
    $createdBy: String!
    $product: ProductInput!
  ) {
    products {
      createProduct(createdBy: $createdBy, product: $product)
    }
  }
`);

export const CreateOrUpdateProductTodoList =
  gql(`mutation CreateProductTodoList(
    $createdBy: String!
    $todos:[ProductTodoInput!]!
    $productId:String!
  ) {
    products {
      createOrUpdateProductTodo(createdBy: $createdBy, todos: $todos, productId: $productId )
    }
  }
`);

export const DeleteProductTodo =
  gql(`mutation DeleteProductTodo($productId: String!) {
  products {
    deleteProductTodo(productId: $productId)
   }
 }
`);

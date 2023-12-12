import { gql } from "@apollo/client";

export const GetOrders = gql(`query GetOrders($orderId: String!) {
  orders {
    lookup(id: $orderId) {
      numberOfProducts
      dueDate
      notes {
        note
        id
        createdAt
        userId
      }
      products {
        photo {
          isFavourite
          name
          size
          stage
          type
          id
          resizedContent
          virtualPath
        }
         todos {
          name
          id
          sortingIndex
          isCompleted
        }
      }
    }
  }
}
`);

export const CreateNote =
  gql(`mutation CreateNote($createdBy: String!, $orderNote: OrderNoteInput!) {
  orderNotes {
    create(createdBy: $createdBy, orderNote: $orderNote)
  }
}
`);

export const EditNote =
  gql(`mutation EditNote($updatedBy: String!, $orderNote: OrderNoteInput!) {
  orderNotes {
    update(updatedBy: $updatedBy, orderNote: $orderNote)
  }
}
`);

export const DeleteNote = gql(`mutation DeleteNote($id: String!) {
  orderNotes {
    delete(id: $id)
  }
}
`);

export const GetNotes = gql(`query GetNotes {
  orderNotes {
    get {
      note
      id
      createdAt
      userId
    }
  }
}
`);

export const GetNote = gql(`query GetNote($orderId: String!) {
  orderNotes {
    lookupByOrder(orderId: $orderId) {
      createdAt
      note
      id
      orderId
      updatedAt
      updatedBy
      userId
      createdBy
    }
  }
}
`);

export const UpdateFavoritePhoto = gql(`mutation updateFavoritePhoto(
  $updatedBy: String!
  $isFavourite: Boolean!
  $id: String!
) {
  photos {
    updateFavourite(updatedBy: $updatedBy, isFavourite: $isFavourite, id: $id)
  }
}
`);

export const UpdateVirtualPath = gql(`mutation updateVirtualpath(
  $updatedBy: String!
  $virtualPath: String!
  $id: String!
) {
  photos {
    updateVirtualPath(updatedBy: $updatedBy, virtualPath: $virtualPath, id: $id)
  }
}
`);

export const GetOrdersByLocId = gql(`
query GetOrdersByLocId($locId: String ! ) {
  orders {
    lookupByLocation(locId: $locId) {
      client {
        fullname
        id
      }
      createdAt
      dueDate
      id
      stage
      price
      numberOfProducts
    }
  }
}
`);
export const GetOrdersByOrganizationId = gql(`
query GetOrdersByOrganizationId($orgId: String !) {
  orders {
    lookupByOrganization(orgId: $orgId) {
      id
      client {
        fullname
        id
      }
      dueDate
      createdAt
      stage
      price
      cost
      numberOfProducts
    }
  }
}
`);
export const GetOrdersByOrganizationIdNew = gql(`
query GetOrdersByOrganizationIdNew($orgId: String !) {
  orders {
    lookupByOrganizationNew(orgId: $orgId) {
      createdAt
      clientFullname
      clientId
      cost
      dueDate
      id
      noOfProducts
      price
      stage
    }
  }
}
`);

export const UpdateOrderStage = gql(`
mutation UpdateOrderStage(
  $id: String!
  $stage: OrderStageEnum!
  $updatedBy: String!
) {
  orders {
    updateStage(id: $id, stage: $stage, updatedBy: $updatedBy)
  }
}
`);

export const UploadPhotos = gql(`mutation uploadPhotos(
  $createdBy: String!
  $photos: [PhotoInput!]!
) {
  photos {
    createBatch(
      createdBy: $createdBy,
      photos: $photos,
       )
  }
}
`);

export const UploadPhoto = gql(`mutation uploadPhoto(
  $createdBy: String!
  $photo: PhotoInput!
) {
  photos {
    create(
      createdBy: $createdBy,
      photo: $photo,
       )
  }
}
`);

export const GetResizedAndThumbnailImage =
  gql(`query GetResizedAndThumbnailImage($id: String! , $photoType : PhotoType!) {
  photos {
    lookup(id: $id) {
     content(photoType: $photoType )
    }
  }
}
`);

export const CreateOrder = gql(`mutation createOrder(
  $createdBy: String!
  $order: OrderInput!
) {
  orders {
    create(
      createdBy: $createdBy,
      order: $order,
       )
  }
}
`);

export const UpdateOrder = gql(`mutation UpdateOrder(
  $updatedBy: String!
  $order: OrderInput!
) {
  orders {
    update(
      updatedBy: $updatedBy,
      order: $order,
       )
  }
}
`);


export const GetPhotosByOrderId = gql(`
query GetPhotosByOrderId($orderId: String ! ) {
  photos {
    lookupByOrder(orderId: $orderId) {
      id
      isFavourite
      name
      orderId
      originalId
      size
      resizedContent
      stage
      thumbnailContent
      type
      virtualPath
    }
  }
}
`);

export const GetTodoListByOrderId = gql(`query GetTodoListByOrderId($orderId: String!) {
  orders {
    lookup(id: $orderId) {
      products {
          id
         todos {
          name
          id
          sortingIndex
          isCompleted
        }
      }
    }
  }
}
`);
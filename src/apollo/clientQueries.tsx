import { gql } from "@apollo/client";

export const GetClient = gql(`query GetClient($userId: String!) {
    clients {
      lookupClient(id: $userId) {
        id
        fullname
        firstname
        lastname
        mailAddress
        phoneNumber
        email
        createdAt
        locId
        billingAddress
        numberOfOrders
        lastContactedAt
        upcomingAppointment {
          startTime
        }
        clientFields {
          name
          datatype
          value
          clientFieldListOptions {
            value
          }
          
        }
      }
    }
  }
`);

export const GetAllClients = gql(`query GetClients {
    clients {
      getClients {
        id
        firstname
        email
        locId
        
        fullname
        createdAt
        phoneNumber
        mailAddress
      }
    }
  }
`);

export const GetClientsByOrgId = gql(`
query GetClientsByOrgId($orgId: String!) {
  clients {
    getClientsByOrg(orgId: $orgId) {
       id
        firstname
        email
        locId
        fullname
        createdAt
        phoneNumber
        mailAddress
    }
  }
}
`);

export const CreateContact = gql(`mutation createClient(
  $createdBy: String!
  $client: ClientInput!
) {
  clients {
    createClient(
      createdBy: $createdBy
      client: $client
    )
  }
}
`);

export const GetClientOrder = gql(`query GetClientOrder($userId: String!) {
  clients {
    lookupClient(id: $userId) {
      orders {
        createdAt
        id
        numberOfProducts
        stage
        dueDate
        orgId
        org {
          name
        }
      }
    }
  }
}
`);

export const CreateClientsFields = gql(`mutation CreateClientsFields(
  $clientFields: [ClientFieldInput!]!,
  $createdBy: String!
){
  clients {
    createClientFields(clientFields: $clientFields, createdBy: $createdBy)
  }
}
`);

export const SendGalleryView = gql(`mutation sendGalleryView(
  $email: String!
  $url: String!
 
) {
  clients {
    sendGalleryViewEmail(
      email: $email
      url: $url
    )
  }
}
`);

export const SetFirebaseId = gql(`
mutation SetFirebaseId($updatedBy: String!, $firebaseId: String!, $clientEmail: String!) {
  clients {
    updateFirebaseId(
      firebaseId: $firebaseId
      updatedBy: $updatedBy
      clientEmail: $clientEmail
    )
  }
}
`);

export const GetClientByFirebaseId = gql(`
query GetClientByFirebaseId($firebaseId: String!) {
  clients {
    lookupClientByFirebaseId(firebaseId: $firebaseId) {
      id
      fullname
      firstname
      lastname
      mailAddress
      phoneNumber
      email
      createdAt
      locId
      billingAddress
      numberOfOrders
      lastContactedAt
      upcomingAppointment {
        startTime
      }
      clientFields {
        name
        datatype
        value
        clientFieldListOptions {
          value
        }
        
      }
    }
  }
}
`);

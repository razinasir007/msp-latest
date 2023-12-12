import { gql } from "@apollo/client";

export const GetUser = gql(`query getUser($id: String!) {
  users {
    lookup(id: $id) {
      address
      email
      firstname
      id
      isActive
      isOnboarded
      lastname
      storeLocId
      favoriteScreenSetting
      phoneNumber
      grantLevel {
        grantLvl
        name
        description
      }
      role {
        id
        name
        description
        permissions
      }
      organization {
        id
        name
        address
        email
        website
        phoneNumber
        discountCheck
        dueDatePolicy
        logo
        subscription {
          currency
          cycleAmount
          id
          intervalCount
          intervalUnit
          isCyclePaid
          userId
          orgId
        }
      }
    }
  }
}
`);

export const GetUsersByOrgId = gql(`query getUsersByOrgID($orgId: String!) {
  users {
    getByOrg(orgId: $orgId) {
      id
      firstname
      lastname
      email
      isActive
      storeLocId
      organization {
        address
        id
      }
      grantLevel {
        description
        grantLvl
        name
      }
      role {
        description
        id
        name
      }
    }
  }
}
`);

export const CreateUser = gql(`mutation createUser(
  $createdBy: String!
  $user: UserInput!
) {
  users {
    create(
      createdBy: $createdBy
      user: $user
    )
  }
}
`);

export const DeleteUser = gql(`mutation deleteUser(
  $id: String!,
  $updatedBy: String!
  ) {
   users {
     delete(id: $id, updatedBy: $updatedBy)
   }
 }
`);

export const CreateInvite = gql(`mutation CreateInvite(
  $userInvitees: [UserInviteeInput!]!
  $createdBy: String!
) {
  users {
    inviteBatch(createdBy: $createdBy, userInvitees: $userInvitees)
  }
}
`);

export const UpdateUser =
  gql(`mutation updateUser($updatedBy: String!, $user: UserInput!) {
  users {
    update(updatedBy: $updatedBy, user: $user)
  }
}
`);

export const GetAllUsers = gql(`query getAllUsers {
  users {
    get {
      id
      firstname
      lastname
      email
      isActive
      storeLocId
      organization {
        address
        id
      }
      grantLevel {
        description
        grantLvl
        name
      }
    }
  }
}
`);

export const UpdateUserRole = gql(`mutation updateUserRole(
    $updatedBy: String!
    $userPermission: UserPermissionInput!
  ) {
    userPermissions {
      update(updatedBy: $updatedBy, userPermission: $userPermission)
    }
  }
`);

export const InviteBatch =
  gql(`mutation InviteBatch($createdBy: String!, $userInvitees: [UserInviteeInput!]!) {
  users {
    inviteBatch(createdBy: $createdBy, userInvitees: $userInvitees)
  }
}
`);

export const UpdateUserOnboarded =
  gql(`mutation UpdateUserOnboarded($id: String!, $isOnboarded: Boolean!) {
  users {
    updateOnboarded(id: $id, isOnboarded: $isOnboarded)
  }
}
`);

export const UpdateUserLocation = gql(`mutation updateUserLocation(
    $updatedBy: String!
    $userLocation: UserLocationInput!
  ) {
    userLocation {
      update(updatedBy: $updatedBy, userLocation: $userLocation)
    }
  }
`);

export const SendEmail =
  gql(`mutation SendEmail($email: EmailInput!, $attachments: [AttachmentInput!] ) {
  emails {
    send(email: $email, attachments: $attachments)
  }
}
`);

export const GetUserSubscriptionByUserId =
  gql(`query GetUserSubscriptionByUserId($id: String!) {
  users {
     lookupSubscriptionPlan(id: $id) 
  }
}
`);

import { gql } from "@apollo/client";

export const CreateLocation = gql(`mutation createLocation(
  $createdBy: String!
  $location: LocationInput!
) {
  locations {
    create(
      createdBy: $createdBy
      location: $location
    )
  }
}
`);

export const UpdateLocation = gql(`mutation updateLocation(
  $updatedBy: String!
  $location: LocationInput!
) {
  locations {
    update(
      location: $location
      updatedBy: $updatedBy
    )
  }
}
`);

export const BindOrganizationLocations =
  gql(`mutation bindOrganizationLocations($createdBy: String!, $organizationLocation: OrganizationLocationInput!) {
  organizationLocations {
    create(
      createdBy: $createdBy
      organizationLocation: $organizationLocation
    )
  }
}
`);

export const BindOrganizationUser = gql(`mutation bindOrganizationUsers(
    $createdBy: String!
    $userOrganization: UserOrganizationInput!
  ) {
    userOrganizations {
      create(createdBy: $createdBy, userOrganization: $userOrganization)
    }
  }  
`);

export const DeleteLocation = gql(`mutation deleteLocation($id: String!) {
  locations {
    delete(id: $id)
  }
  organizationLocations {
    delete(locId: $id)
  }
}
`);

export const OnboardingService = gql(`mutation onboardingService(
  $createdBy: String!
  $org: OrganizationInput!
  $userOrganization: UserOrganizationInput!
  $location: LocationInput!
  $organizationLocation: OrganizationLocationInput!
   $locSalesTax: LocationSalesTaxInput!
  $updatedBy: String!
  $user: UserInput!
) {
  organizations {
    create(createdBy: $createdBy, org: $org)
  }
  userOrganizations {
    create(createdBy: $createdBy, userOrganization: $userOrganization)
  }
  locations {
    create(createdBy: $createdBy, location: $location)
  }
  organizationLocations {
    create(createdBy: $createdBy, organizationLocation: $organizationLocation)
  }
 locationSalesTax {
  create(
        createdBy: $createdBy
        locSalesTax: $locSalesTax

    )
 }
  users {
    update(updatedBy: $updatedBy, user: $user)
  }
}
`);

export const OboardingProfileUpdate = gql(`mutation oboardingProfileUpdate(
  $createdBy: String!
  $updatedBy: String!
  $user: UserInput!
  $location: LocationInput!
  $userLocation: UserLocationInput!
) {
  users {
    update(updatedBy: $updatedBy, user: $user)
  }
  locations {
    create(createdBy: $createdBy, location: $location)
  }
  userLocation {
    create(createdBy: $createdBy, userLocation: $userLocation)
  }
}
`);

export const ConfirmInvitee = gql(`query confirmInvitee($email: String!) {
  users {
    confirmInvitee(email: $email)
  }
}
`);

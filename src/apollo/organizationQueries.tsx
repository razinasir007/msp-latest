import { gql } from "@apollo/client";

export const GetOrganization =
  gql(`query getOrganizationByUserId($userId: String!) {
  organizations {
    lookupByUser(userId: $userId) {
      id
      email
      name
      logo
      phoneNumber
      website
      address
      discountCheck
      discountCodeCheck
      dueDatePolicy
      locations {
        address
        administrativeArea
        administrativeAreaLevel2
        countryName
        email
        id
        isPrimary
        name
        phoneNumber
        placeName
        postalCode
        subUnitDesignator
        subUnitIdentifier
        sublocality
        thoroughfareName
        thoroughfareNumber
      }
    }
  }
}
`);

export const UpdateOrganization = gql(`mutation updateOrganization(
  $org: OrganizationInput!
  $updatedBy: String!
) {
  organizations {
    update(
      org: $org
      updatedBy: $updatedBy
    )
  }
}
`);

export const CreateOrganization = gql(`mutation createOrganization(
  $createdBy: String!
  $org: OrganizationInput!
  ) {
    organizations {
      create(
        createdBy: $createdBy
        org: $org

    )
  }
}
`);

export const GetOrgLocs = gql(`query GetOrgLocs($orgId: String!) {
 organizations {
    lookup(id: $orgId) {
      locations {
        id
        name
        address
        screenSettings {
          id
          name
          ppi
        }
      }
    }
  }
}
`);

export const CreateOrgDiscountCodes = gql(`mutation CreateOrgDiscountCodes(
  $createdBy: String!
  $organizationDiscount: OrganizationDiscountInput!
  $orgId:String!
  ) {
    organizationDiscounts { 
      create(
        createdBy: $createdBy
        organizationDiscount: $organizationDiscount
        orgId:$orgId

    )
  }
}
`);
export const GetOrgDiscountCodes = gql(`
query GetOrgDiscountCodes($orgId: String!) {
  organizationDiscounts {
    lookupByOrganization(orgId: $orgId) {
      discountCodeText
      discountValue
      discountValueType
      id
      orgId
    }
  }
}
`);

export const DeleteOrgDiscountCodes = gql(`mutation DeleteOrgDiscountCodes(
  $id: String!
  ) {
    organizationDiscounts { 
      delete(
        id:$id

    )
  }
}
`);

export const UpdateOrgDiscountCodes = gql(`mutation UpdateOrgDiscountCodes(
  $updatedBy: String!
  $organizationDiscount: OrganizationDiscountInput!
  ) {
    organizationDiscounts { 
      update(
        updatedBy: $updatedBy
        organizationDiscount: $organizationDiscount

    )
  }
}
`);

export const CreateLocationSalesTax = gql(`mutation CreateLocationSalesTax(
  $createdBy: String!
  $locSalesTax: LocationSalesTaxInput!
  ) {
    locationSalesTax { 
      create(
        createdBy: $createdBy
        locSalesTax: $locSalesTax

    )
  }
}
`);

export const UpdateLocationSalesTax = gql(`mutation UpdateLocationSalesTax(
  $updatedBy: String!
  $locSalesTax: LocationSalesTaxInput!
  ) {
    locationSalesTax { 
      update(
        updatedBy: $updatedBy
        locSalesTax: $locSalesTax

    )
  }
}
`);

export const DeleteLocationSalesTax = gql(`mutation DeleteLocationSalesTax(
  $locId: String!
  ) {
    locationSalesTax { 
      delete(
        locId:$locId

    )
  }
}
`);

export const GetLocationSalesTaxByLocId = gql(`
query GetLocationSalesTax($locId: String!) {
  locationSalesTax {
    lookup(locId: $locId) {
      locId
      salesTaxPercentage
    }
  }
}
`);

export const GetOrganizationLogo = gql(`
query GetOrganizationLogo($id: String!) {
  organizations {
    lookup(id: $id) {
      name
      logo
    }
  }
}
`);
export const GetOrgClientDocs = gql(`
query GetOrgClientDocs($clientId: String!) {
  organizationFormsFilled {
    lookupByClient(clientId: $clientId) {
      createdAt
      pdf
      updatedAt
      formType
    }
  }
}
`);
export const UploadRoomViewImageeForOrg =
  gql(`mutation UploadRoomViewImageeForOrg(
  $createdBy: String!
  $roomView: RoomViewInput!
  ) {
    roomView { 
      createRoomView(
        createdBy: $createdBy
        roomView: $roomView

    )
  }
}
`);
export const GetRoomViewImagesByOrgId = gql(`
query GetRoomViewImagesByOrgId($orgId: String!,  $photoType: PhotoType!,) {
  roomView {
    lookupByOrganization(orgId: $orgId) {
      content(photoType: $photoType )
      id
      ppi
      type
      x
      y
    }
  }
}
`);

export const DeleteRoomViewDetails = gql(`mutation DeleteRoomViewDetails(
  $id: String!
  ) {
    roomView { 
      deleteRoomView(
        id:$id

    )
  }
}
`);

export const UpdateRoomDetails = gql(`mutation UpdateRoomDetails(
  $updatedBy: String!
  $roomView: RoomViewInput!
  ) {
    roomView { 
      updateRoomView(
        updatedBy: $updatedBy
        roomView: $roomView

    )
  }
}
`);

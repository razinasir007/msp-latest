import { gql } from "@apollo/client";


export const CreateScreenSettings = gql(`mutation createScreenSettings(
  $createdBy: String!
  $screenSetting: ScreenSettingInput!
  ) {
    screenSettings {
      create(
        createdBy: $createdBy
        screenSetting: $screenSetting

    )
  }
}
`);

export const DeleteScreenSettings = gql(`mutation deleteScreenSettings(
  $id: String!
  ) {
    screenSettings {
      delete(
        id: $id      
    )
  }
}
`);

export const UpdateScreenSettings = gql(`mutation updateScreenSettings(
 $updatedBy: String!
  $screenSetting: ScreenSettingInput!
  ) {
    screenSettings {
      update(
        updatedBy: $updatedBy
        screenSetting: $screenSetting

    )
  }
}
`);

export const GetScreenSettingsById =
  gql(`query GetScreenSettingsById($id: String!) {
   screenSettings {
    lookup(id: $id) {
      name
      ppi
      id
      locationId
    }
  }
}
`);
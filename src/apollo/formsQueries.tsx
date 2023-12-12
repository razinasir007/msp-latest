import { gql } from "@apollo/client";

export const GetFormsByOrgId = gql(`query GetFormsByOrgId($orgId: String!) {
        organizationForms {
          lookupByOrganization(orgId: $orgId) {
            name
            locId
            orgId
            id
          }
        }
      }
    `);

export const CreateForm = gql(`
mutation CreateForm($createdBy: String!, $id: String!, $locId: String!, $name: String!, $orgId: String!) {
    organizationForms {
      create(
        orgForm: {id: $id, name: $name, orgId: $orgId, locId: $locId, createdBy: $createdBy}
      )
    }
  }
`);

export const DeleteForm = gql(`
mutation DeleteForm($id: String!) {
  organizationForms {
    delete(id: $id)
  }
}
`);

export const GetFieldsByFormId = gql(`
query GetFieldsByFormId($formId: String!) {
  organizationForms {
    getItems(formId: $formId)
  }
}
`);

export const GetCheckoutFormByLocation = gql(`
query GetCheckoutFormByLocation($locId: String !, $name: String !) {
  organizationForms {
    getItemsByLocationAndName(locId: $locId, name: $name)
  }
}
`);

export const UpdateFormFields = gql(`
mutation UpdateFormFields($id: String!, $itemsJson: JSON!, $updatedBy: String!) {
  organizationForms {
    updateItems(id: $id, itemsJson: $itemsJson, updatedBy: $updatedBy)
  }
}
`);

export const SendFormLink = gql(`
mutation SendFormLink($content: String! , $email: String!, $subject: String!) {
  emails {
    send(email: {subject: $subject, email: $email, content: $content})
  }
}
`);

export const CreateCheckoutForm = gql(`
mutation CreateCheckoutForm($createdBy: String!, $clientId: String!, $formType: String!, $id: String!, $orderId: String!, $pdf: Upload!) {
  organizationFormsFilled {
    create(
      orgForm: {createdBy: $createdBy, id: $id, clientId: $clientId, formType: $formType, pdf: $pdf, orderId: $orderId}
    )
  }
}
`)

export const SaveFilledForm = gql(`
mutation SaveFilledForm($clientId: String!, $createdBy: String!, $formType: String!, $id: String!, $pdf: Upload!) {
  organizationFormsFilled {
    create(
      orgForm: {id: $id, createdBy: $createdBy, clientId: $clientId, formType: $formType, pdf: $pdf}
    )
  }
}
`)

export const SaveFilledIntakeForm = gql(`
mutation SaveFilledIntakeForm($clientId: String!, $createdBy: String!, $formType: String!, $id: String!, $pdf: Upload!, $values: JSON!) {
  organizationFormsFilled {
    create(
      orgForm: {id: $id, createdBy: $createdBy, clientId: $clientId, formType: $formType, pdf: $pdf, values: $values}
    )
  }
}
`)

export const GetClientAdditionalInfo = gql(`
query GetClientAdditionalInfo($clientId: String!, $formType: String!) {
  organizationFormsFilled {
    lookupByTypeAndClient(clientId: $clientId, formType: $formType) {
      values
    }
  }
}
`)
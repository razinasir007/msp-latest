import { gql } from "@apollo/client";

// load all clients, locations apointments for an organization
export const GetCalendarInfo = gql(`
  query GetCalendarInfo($orgId:String!){
    organizations {
      lookup(id: $orgId){
        clients {
          id
          fullname
          phoneNumber
        }
        locations {
          id 
          address
        }
        appointments {
          clientId
          createdAt
          createdBy
          description
          endTime
          id
          isInternal
          locationId
          orgId
          startTime
          title
          updatedAt
          updatedBy
          userId
        }
      }
    }
  }
`);

export const GetAppointments = gql(`
  query GetAppointments($orgId: String!) {
    appointments {
      getByOrganization(orgId: $orgId) {
        clientId
        createdAt
        createdBy
        description
        endTime
        id
        isInternal
        locationId
        orgId
        startTime
        title
        updatedAt
        updatedBy
        userId
      }
    }
  }
`);

export const CreateAppointment = gql(`
  mutation CreateAppointment($createdBy: String!, $appointment: AppointmentInput!) {
    appointments {
      create(
        appointment: $appointment
        createdBy: $createdBy
      )
    }
  }
`);

export const UpdateAppointment = gql(`
  mutation UpdateAppointment($updatedBy: String!, $appointment: AppointmentInput!){
    appointments {
      update(updatedBy:$updatedBy, appointment:$appointment)
    }
  }
`);

export const DeleteAppointment = gql(`
    mutation DeleteAppointment($appointmentId: String!) {
        appointments {
            delete(id: $appointmentId)
        }
    }
`);

export const GetCalendarIntegrationUrl = gql(`query getCalendarIntegrationUrl
  (
    $serviceName:ExternalAuthServiceEnum!
    $userId:String!
 ) {
  integrations {
    getIntegrationUrl(
          serviceName: $serviceName
          userId:  $userId
        )
      }
}
`);

export const GetCalendarIntegrationStatus =
  gql(`query getCalendarIntegrationStatus
  (
    $serviceName:ExternalAuthServiceEnum!
    $userId:String!
 ) {
  integrations {
    getIntegrationStatus(
          serviceName: $serviceName
          userId:  $userId
        )
      }
}
`);

export const DisconnectCalendar = gql(`mutation disconnect
  (
    $serviceName:ExternalAuthServiceEnum!
    $userId:String!
 ) {
  integrations {
    disconnect(
          serviceName: $serviceName
          userId:  $userId
        )
      }
}
`);

export const GetAppointmentsByClients = gql(`
  query GetAppointmentsByClients($clientId: String!) {
    appointments {
      getByClient(clientId: $clientId) {
        clientId
        createdAt
        createdBy
        description
        endTime
        id
        isInternal
        locationId
        orgId
        startTime
        title
        updatedAt
        updatedBy
        userId
      }
    }
  }
`);

export const CreateReminderTimes = gql(`mutation CreateReminderTimes
  (
    $createdBy:String!
    $orgId:String!
    $reminders:[AppointmentReminderTimesInput!]!
 ) {
  appointments {
    createReminderTimes(
          createdBy: $createdBy
          orgId:$orgId
          reminders:$reminders
        )
      }
}
`);
export const UpdateReminderTimes = gql(`mutation UpdateReminderTimes
  (
    $createdBy:String!
    $orgId:String!
    $reminders:[AppointmentReminderTimesInput!]!
 ) {
  appointments {
    updateReminderTimes(
          createdBy: $createdBy
          orgId:$orgId
          reminders:$reminders
        )
      }
}
`);

export const GetReminderTimesByOrgId = gql(`
  query GetReminderTimesByOrgId($orgId: String!) {
    appointments {
      lookupReminderTimesByOrg(orgId: $orgId) {
      label
      value
   
      }
    }
  }
`);

export const CreateReminder = gql(`mutation CreateReminder
  (  $orgId:String!
    $reminder: TextReminderInput!
 ) {
  appointments {
    sendReminder( 
          orgId: $orgId
          reminder:$reminder
        )
      }
}
`);

export const GetOutboundEvents = gql(`
  query GetOutboundEvents {
    inboundOutbountEvents {
      getOutboundEvents {
      createdAt
      event
      id
      body {
        attribute
        id
      }
      }
    }
  }
`);

export const AddUrlsForOutboundEvent = gql(`mutation AddUrlsForOutboundEvent
  ( $createdBy: String! 
   $eventId: String! 
    $orgId:String!
    $urls: [String!]!
 ) {
  inboundOutboundEvents {
    insertOutboundUrls( 
          createdBy: $createdBy
          eventId: $eventId
          orgId: $orgId
          urls:$urls
        )
      }
}
`);
export const GetOutboundEventsByOrgId = gql(`
  query GetOutboundEventsByOrgId($orgId: String!) {
    inboundOutbountEvents {
      lookupOutboundEventsByOrganization(orgId: $orgId) 
    }
  }
`);

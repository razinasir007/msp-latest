import { gql } from "@apollo/client";

// get notifications with org id for app (drawer)
export const getNotificationsByOrgId = gql(`
query getNotificationsByOrgIdWindowed($orgId: String !, $userId: String!, $window: Int!) {
  notifications {
    getNotifications(orgId: $orgId, userId: $userId,  window: $window) {
      isRead
      notification {
        id
        createdBy
        content
        type
        timestamp
      }
    }
  }
}
`)

// get notifications with org id for notifications page 
export const getNotificationsByOrgIdForNotificationsPage = gql(`
query getNotificationsByOrgId($orgId: String !, $userId: String!) {
  notifications {
    getNotifications(orgId: $orgId, userId: $userId) {
      isRead
      notification {
        id
        createdBy
        content
        type
        timestamp
      }
    }
  }
}
`)

export const markAsRead=gql(`
mutation markAsRead($userId: String !, $notificationId: String !) {
    notifications {
      markAsRead(notificationId: $notificationId, userId: $userId)
    }
  }
`)
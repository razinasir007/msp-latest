import { gql } from "@apollo/client";

// get notifications with org id for app (drawer)
export const SendDemoRequestEmail = gql(`
    mutation sendDemoRequestEmail($subject: String!, $content: String!) {
        emails {
            send(email: { subject: $subject, email: "info@mystudiopro.com", content: $content })
        }
    }
`)
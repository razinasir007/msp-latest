import React from "react";
import { useQuery } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import moment from "moment";
import { useLocation } from "react-router-dom";
import { GetClient } from "../../../apollo/clientQueries";
import { ClientDetailsBar } from "../../components/clientView/clientDetailsBar/clientDetailsBar";
import { ClientViewAccount } from "./account";

export default function ClientView() {
  const { state } = useLocation();

  const {
    loading: clientLoading,
    error: clientError,
    data: ClientDetails,
  } = useQuery(GetClient, {
    variables: { userId: state.id },
  });
  return (
    <Box>
      <ClientDetailsBar
        loading={clientLoading}
        name={ClientDetails?.clients?.lookupClient.fullname}
        email={ClientDetails?.clients?.lookupClient.email}
        phoneNumber={
          ClientDetails?.clients?.lookupClient.phoneNumber
            ? ClientDetails?.clients?.lookupClient.phoneNumber
            : "None"
        }
        createdAt={moment(
          ClientDetails?.clients?.lookupClient.createdAt
        ).format("MMMM Do YYYY")}
        location={
          ClientDetails?.clients?.lookupClient.billingAddress
            ? ClientDetails?.clients?.lookupClient.billingAddress
            : "None"
        }
        lastContactedAt={
          ClientDetails?.clients?.lookupClient.lastContactedAt !== null
            ? ClientDetails?.clients?.lookupClient.lastContactedAt
            : "None"
        }
        totalOrder={ClientDetails?.clients?.lookupClient.numberOfOrders}
        appointments={
          ClientDetails?.clients?.lookupClient.upcomingAppointment
            ? moment(
                ClientDetails?.clients?.lookupClient.upcomingAppointment
                  .startTime
              ).format("MMMM Do YYYY")
            : "None"
        }
      />
      <Box className='client-view-account'>
        <ClientViewAccount client={state} />
      </Box>
    </Box>
  );
}

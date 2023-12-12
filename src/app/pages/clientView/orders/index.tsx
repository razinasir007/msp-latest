import React from "react";
import {
  Grid,
  GridItem,
  Text,
  HStack,
  Box,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
} from "@chakra-ui/react";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import { ClientDetailsBar } from "../../../components/clientView/clientDetailsBar/clientDetailsBar";
import { ClinetViewInvoice } from "./invoicePayments";
import { useLocation, useNavigate } from "react-router-dom";
import { ClientViewImages } from "./clientviewImages";
import { Documents } from "./documents";
import { Notes } from "./notes";
import moment from "moment";
import { useQuery } from "@apollo/client";
import { GetClient } from "../../../../apollo/clientQueries";
import { Files } from "./files";
import { TodoListForClient } from "./todoList";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { CLIENT_ROLE } from "../../../../constants";

export default function ClientViewOrder() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { clientId, order } = state;
  const global_state = useHookstate(globalState);
  const stateUser = global_state.user.get();
  const {
    loading: clientLoading,
    error: clientError,
    data: ClientDetails,
  } = useQuery(GetClient, {
    variables: { userId: clientId },
  });
  const trimmedOrderId = order.slice(0, 5) + "...";
  return (
    <>
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
        totalOrder={ClientDetails?.clients?.lookupClient.numberOfOrders}
        location={
          ClientDetails?.clients?.lookupClient.billingAddress
            ? ClientDetails?.clients?.lookupClient.billingAddress
            : "None"
        }
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
        <Grid
          templateAreas={`"header"
              "content"
              "footer"`}
          gridTemplateRows={"35px 1fr 61px"}
          gridTemplateColumns={"1fr"}
          h='100%'
        >
          <GridItem padding={"24px 24px 16px"} area={"header"}>
            <HStack spacing='10px'>
              <IoChevronBackCircleSharp
                size={35}
                color='#EAE8E3'
                onClick={() => navigate(-1)}
                style={{ cursor: "pointer" }}
              />
              <Text w='100%' fontSize='h2' fontWeight='600' lineHeight='35px'>
                Order #{trimmedOrderId}
              </Text>
            </HStack>
          </GridItem>
        </Grid>
        <Tabs colorScheme='gray'>
          <TabList paddingLeft='20px'>
            <Tab>Invoice/Payment</Tab>
            <Tab>Images</Tab>
            <Tab>Documents</Tab>
            {stateUser?.role.name === CLIENT_ROLE.name ? null : (
              <Tab>Notes</Tab>
            )}
            {stateUser?.role.name === CLIENT_ROLE.name ? null : (
              <Tab>Files</Tab>
            )}
            {stateUser?.role.name === CLIENT_ROLE.name ? null : (
              <Tab>Todo List</Tab>
            )}
          </TabList>
          <TabPanels>
            <TabPanel>
              <ClinetViewInvoice clientId={clientId} orderId={order} />
            </TabPanel>
            <TabPanel>
              <ClientViewImages
                orderId={order}
                clientEmail={ClientDetails?.clients?.lookupClient.email}
              />
            </TabPanel>
            <TabPanel>
              <Documents clientId={clientId} />
            </TabPanel>
            <TabPanel>
              <Notes orderId={order} />
            </TabPanel>
            <TabPanel>
              <Files orderId={order} />
            </TabPanel>
            <TabPanel>
              <TodoListForClient orderId={order} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
}

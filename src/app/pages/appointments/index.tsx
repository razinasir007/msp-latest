import React, { useEffect, useState } from "react";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  Box,
  Card,
  CardBody,
  Center,
  Flex,
  Grid,
  GridItem,
  HStack,
  SimpleGrid,
  SkeletonText,
  Text,
} from "@chakra-ui/react";
import { GetAllClients } from "../../../apollo/clientQueries";
import { AddAppointment } from "../../components/imageUploader/addAppointment";
import { SelectDropdown } from "../../components/shared/selectDropdown";
import { ClientDetails } from "../../components/interfaces";
import { AppointmentCard } from "../../components/appointments/appointmentCard";
import { GetAppointmentsByClients } from "../../../apollo/appointmentQueries";
import { CheckIcon, ChevronRightIcon } from "@chakra-ui/icons";
import moment from "moment";
import { AddContact } from "../../components/contacts/addContact";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export const AppointmentsForTools = (props: {
  selectedAppointmentId;
  setSelectedAppointmentId;
  clientNameAndId;
  setClientNameAndId;
}) => {
  const {
    selectedAppointmentId,
    setSelectedAppointmentId,
    clientNameAndId,
    setClientNameAndId,
  } = props;
  const [clientDetailsState, setClientDetails] = useState<ClientDetails[]>([]);
  const {
    loading: clientLoading,
    error: clientError,
    data: ClientDetails,
    refetch: GetAllClientsRefetch,
  } = useQuery(GetAllClients);

  const [
    GetAppointment,
    {
      loading: appointmentLoading,
      data: appointmentData,
      refetch: GetAppointmentRefetch,
    },
  ] = useLazyQuery(GetAppointmentsByClients);

  useEffect(() => {
    if (ClientDetails) {
      const formattedData = ClientDetails.clients.getClients.map((ele) => ({
        id: ele.id,
        fullname: ele.fullname,
        phoneNumber: ele.phoneNumber,
        email: ele.email,
      }));
      setClientDetails(formattedData);
    }
  }, [ClientDetails]);

  const handleDropDownChange = (options) => {
    if (options.value !== null) {
      GetAppointment({
        variables: {
          clientId: options.value,
        },
      });
    }
    setClientNameAndId(options);
  };

  const handleSelectClick = (appointmentId) => {
    if (selectedAppointmentId === appointmentId) {
      // If the clicked appointment is already selected, unselect it
      setSelectedAppointmentId(null);
    } else {
      // Otherwise, select the clicked appointment
      setSelectedAppointmentId(appointmentId);
    }
  };
  return (
    <>
      <Grid
        templateAreas={`"header"
                "content"
                "footer"`}
        gridTemplateRows={"75px 1fr 61px"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <HStack justifyContent='space-between'>
            <Text fontSize='40px' fontWeight='600' lineHeight='35px'>
              Appointments
            </Text>
          </HStack>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <Card variant='outline' style={mainCardStyle}>
            <CardBody padding='16px'>
              <Flex justifyContent='space-between'>
                <Box>
                  <Text fontSize='h5' fontWeight='semi-bold'>
                    Appointment Details
                  </Text>
                </Box>
                <HStack spacing='10px'>
                  <AddContact GetAllClientsRefetch={GetAllClientsRefetch} />
                  <AddAppointment
                    GetAppointmentRefetch={GetAppointmentRefetch}
                  />
                </HStack>
              </Flex>
              <Box w='100%' mt='30px'>
                <HStack>
                  <Text fontSize='p5' fontWeight='semibold' mb='15px'>
                    Select a client:
                  </Text>
                  <Box w='220px'>
                    <SelectDropdown
                      containerHeight='55px'
                      value={clientNameAndId}
                      placeholder='Clients'
                      options={clientDetailsState.map((client) => ({
                        label: client.fullname,
                        value: client.id,
                      }))}
                      loading={clientLoading}
                      onChange={handleDropDownChange}
                    />
                  </Box>
                </HStack>
              </Box>
              <Box w='100%' mt='60px'>
                {appointmentLoading ? (
                  <Box
                    padding='6'
                    boxShadow='lg'
                    bg='greys.400'
                    width='100%'
                    minH='235px'
                    maxH='235px'
                    mt='20px'
                    borderRadius='4px'
                  >
                    <SkeletonText
                      mt='4'
                      noOfLines={5}
                      spacing='4'
                      skeletonHeight='5'
                    />
                  </Box>
                ) : appointmentData?.appointments?.getByClient?.length > 0 ? (
                  <>
                    <SimpleGrid columns={4} spacing='20px' w='100%'>
                      {appointmentData?.appointments?.getByClient?.map(
                        (ele, index) => {
                          return (
                            <Box key={index}>
                              <AppointmentCard
                                title={ele.title}
                                description={ele.description}
                                buttonIcon={
                                  selectedAppointmentId === ele.id ? (
                                    <CheckIcon />
                                  ) : (
                                    <ChevronRightIcon />
                                  )
                                }
                                buttonText={
                                  selectedAppointmentId === ele.id
                                    ? "Selected"
                                    : "Select"
                                }
                                handleClick={() => handleSelectClick(ele.id)}
                                endDate={moment(ele.endTime).format("LLLL")}
                                startDate={moment(ele.startTime).format("LLLL")}
                              />
                            </Box>
                          );
                        }
                      )}
                    </SimpleGrid>
                  </>
                ) : (
                  <Center>
                    <Text fontSize='p4'>
                      No Appointments Available, Please Create A New Appointment
                      To Proceed
                    </Text>
                  </Center>
                )}
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </>
  );
};

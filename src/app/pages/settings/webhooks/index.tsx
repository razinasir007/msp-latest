import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Grid,
  GridItem,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  VStack,
  useDisclosure,
  HStack,
  ModalFooter,
  Input,
  Button,
  SkeletonText,
} from "@chakra-ui/react";
import { LuWebhook } from "react-icons/lu";
import { SelectDropdown } from "../../../components/shared/selectDropdown";
import { AppointmentCard } from "../../../components/appointments/appointmentCard";
import { TiTick } from "react-icons/ti";
import { AiTwotoneDelete } from "react-icons/ai";
import { TbPointFilled } from "react-icons/tb";
import { TodoList } from "../../../../state/interfaces";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQuery } from "@apollo/client";
import {
  AddUrlsForOutboundEvent,
  GetOutboundEvents,
  GetOutboundEventsByOrgId,
} from "../../../../apollo/appointmentQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import Swal from "sweetalert2";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
  marginTop: "20px",
  minHeight: "500px",
};
export const Webooks = () => {
  const user = useHookstate(globalState.user);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appointmentEvents, setAppointmentEvents] = useState({
    id: "",
    body: [
      {
        attribute: "",
      },
    ],
    value: "",
    event: "",
  });
  const [events, setEvents] = useState([
    {
      event: "",
      id: "",
      body: [],
    },
  ]);
  const [configuredEvents, setConfiguredEvents] = useState([
    {
      event_name: "",
      urls: [],
      attributes: [],
    },
  ]);
  const [url, setUrl] = useState("");
  const [urlList, setUrlList] = useState<TodoList[]>([]);
  const [eventDetails, setEventDetails] = useState<any>([]);
  const [InsertUrls, InsertUrlResponse] = useMutation(AddUrlsForOutboundEvent);

  const {
    loading: eventsLoading,
    error: eventsError,
    data: eventsData,
  } = useQuery(GetOutboundEvents);
  const {
    loading: eventsByOrgIdsLoading,
    error: eventsByOrgIdError,
    data: eventsByOrgIdData,
    refetch: RefetchEvents,
  } = useQuery(GetOutboundEventsByOrgId, {
    variables: { orgId: user?.value?.organization?.id },
  });
  useEffect(() => {
    if (
      eventsData &&
      eventsData.inboundOutbountEvents &&
      eventsData.inboundOutbountEvents.getOutboundEvents
    ) {
      const formattedData =
        eventsData.inboundOutbountEvents.getOutboundEvents.map((event) => {
          return {
            body: event.body,
            createdAt: event.createdAt,
            event: event.event,
            id: event.id,
          };
        });
      setEvents(formattedData);
    }
  }, [eventsData]);
  useEffect(() => {
    if (
      eventsByOrgIdData &&
      eventsByOrgIdData.inboundOutbountEvents &&
      eventsByOrgIdData.inboundOutbountEvents.lookupOutboundEventsByOrganization
    ) {
      const formattedData =
        eventsByOrgIdData.inboundOutbountEvents.lookupOutboundEventsByOrganization.map(
          (event) => {
            return {
              attributes: event.attributes,
              event_id: event.event_id,
              event_name: event.event_name,
              urls: event.urls,
            };
          }
        );
      setConfiguredEvents(formattedData);
    }
  }, [eventsByOrgIdData]);
  const addUrl = () => {
    if (url.trim() !== "") {
      const newTask = {
        id: uuidv4(), // Generate a unique ID
        name: url,
        sortingIndex: urlList.length,
        isCompleted: true,
      };
      setUrlList([...urlList, newTask]);
      setUrlList;
      setUrl("");
    }
  };
  const removeUrl = (taskId) => {
    const updatedUrl = urlList.filter((task) => task.id !== taskId);
    setUrlList(updatedUrl);
  };

  const handleOnChange = (value) => {
    onOpen();
    setAppointmentEvents(value);
  };
  const handleAddUrl = () => {
    const urlStrings = urlList.map((ele) => {
      return ele.name;
    });
    InsertUrls({
      variables: {
        createdBy: user!.value?.uid,
        orgId: user!.value?.organization?.id,
        eventId: appointmentEvents.value,
        urls: urlStrings,
      },
      onCompleted: (res) => {
        if (res.inboundOutboundEvents.insertOutboundUrls == true) {
          RefetchEvents();
          onClose();
          Swal.fire("Success!", "Urls inserted successfully!", "success");
          setUrlList([]);
        } else {
          Swal.fire("Error!", "Error while adding the urls!", "error");
          setUrlList([]);
        }
      },
    });
  };

  return (
    <Box>
      <Grid
        templateAreas={`"header"
        "content"`}
        gridTemplateRows={"75px 1fr"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <Text w='100%' fontSize='h2' fontWeight='semibold' lineHeight='35px'>
            Webhook Configuration
          </Text>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <Card variant='outline' style={mainCardStyle}>
            <CardHeader padding='8px'>
              <Flex justifyContent='space-between' alignItems='center'>
                <Text fontSize='p3' fontWeight='semibold' lineHeight='35px'>
                  Outbound Events
                </Text>

                <Box w='380px' mt='22px'>
                  <SelectDropdown
                    labelSize='p4'
                    placeholder='Select a outbound event'
                    loading={eventsLoading}
                    options={events.map((ele) => ({
                      label: ele.event,
                      value: ele.id,
                      body: ele.body,
                    }))}
                    onChange={(value) => {
                      handleOnChange(value);
                    }}
                  />
                </Box>
              </Flex>
            </CardHeader>
            <CardBody>
              {eventsByOrgIdsLoading ? (
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
              ) : configuredEvents && configuredEvents.length > 0 ? (
                <SimpleGrid columns={3} spacing='20px' w='100%' mt='50px'>
                  {configuredEvents.map((event, index) => {
                    return (
                      <Box key={index}>
                        <AppointmentCard
                          title={event.event_name}
                          numberOfAttributes={event.attributes}
                          numberOfUrls={event.urls}
                          configuredEvent={eventDetails}
                          handleClick={() => setEventDetails(event)}
                        />
                      </Box>
                    );
                  })}
                </SimpleGrid>
              ) : (
                <Center
                  minH='235px'
                  mt='50px'
                  flexDirection='column'
                  borderRadius='4px'
                  border={"1px dashed #8A8A8A"}
                >
                  <LuWebhook size={"40px"} />
                  <Text fontSize='h5' fontWeight='semibold' mt='10px'>
                    No outbound events available
                  </Text>
                  <Text fontSize='p4' fontWeight='normal'>
                    Please select a outbound event
                  </Text>
                </Center>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size='lg'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add URLs for outbound events:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={2}>
              <HStack>
                <Text fontSize='p5' fontWeight='semibold'>
                  Attributes:{" "}
                </Text>
                {appointmentEvents.body.length > 0 ? (
                  appointmentEvents.body.map((event, index) => {
                    return (
                      <Box key={index}>
                        <Text fontSize='p5'>
                          {index < appointmentEvents.body.length - 1
                            ? `${event.attribute}, `
                            : event.attribute}
                        </Text>
                      </Box>
                    );
                  })
                ) : (
                  <Text fontSize='p5'>No Attribute Available</Text>
                )}
              </HStack>
              <HStack w='100%'>
                <Input
                  placeholder='Url'
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <TiTick
                  size={30}
                  style={{ cursor: "pointer" }}
                  onClick={addUrl}
                />
              </HStack>
              <VStack align='start' w='100%' mt='20px'>
                {urlList ? (
                  urlList.map((url) => (
                    <Box key={url.id} w='100%'>
                      <Flex justifyContent='space-between'>
                        <HStack>
                          <TbPointFilled size={20} />
                          <Text fontSize='p4'> {url.name}</Text>
                        </HStack>
                        <AiTwotoneDelete
                          size={22}
                          style={{ cursor: "pointer" }}
                          onClick={() => removeUrl(url.id)}
                        />
                      </Flex>
                    </Box>
                  ))
                ) : (
                  <Text>No url added</Text>
                )}
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button size='sm' variant='outline' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              size='sm'
              isLoading={InsertUrlResponse.loading}
              onClick={handleAddUrl}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

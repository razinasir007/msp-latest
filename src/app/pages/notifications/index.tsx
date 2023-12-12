import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Card,
  CardBody,
  Center,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  SkeletonCircle,
  SkeletonText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { GoDotFill } from "react-icons/go";
import { useMutation, useQuery } from "@apollo/client";
import {
  getNotificationsByOrgIdForNotificationsPage,
  markAsRead,
} from "../../../apollo/notificationQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { Notification } from "../../../state/interfaces";
import moment from "moment";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export default function Notifications() {
  //to get user, related organizaiton and get/set notifications state for that org and user
  const state = useHookstate(globalState);
  const user = state.user;
  const notifications = state.notifications;

  //For Getting Notifications of the Current Organization
  const {
    loading: notificationsLoading,
    data: notificationsData,
    startPolling: startNotificationsPolling,
    stopPolling: stopNotificationsPolling,
  } = useQuery(getNotificationsByOrgIdForNotificationsPage, {
    variables: {
      orgId: user!.value!.organization!.id,
      userId: user!.value!.uid,
    },
  });

  //mutation for mark as read
  const [
    markAsReadNotification,
    {
      loading: markAsReadLoading,
      error: markAsReadError,
      data: markAsReadData,
    },
  ] = useMutation(markAsRead, {});

  useEffect(() => {
    if (notificationsData) {
      if (notificationsData.notifications.getNotifications) {
        // Sorting the notifications based on the timestamp
        const sortedNotifications =
          notificationsData.notifications.getNotifications.sort((a, b) => {
            // Parsing the timestamps using the moment library
            const timestampA = moment(a.notification.timestamp);
            const timestampB = moment(b.notification.timestamp);

            // Comparing the timestamps and returning the sort order
            if (timestampA.isBefore(timestampB)) {
              return 1; // return 1 indicates that a is before b (a should come below  b)
            } else if (timestampA.isAfter(timestampB)) {
              return -1; // return -1 indicates that a is after b (a should come above b)
            } else {
              return 0;
            }
          });

        // Setting the sorted notifications as the state
        notifications.set(sortedNotifications);
      }
    }
  }, [notificationsData]);

  //useEffect for polling
  useEffect(() => {
    // Start polling when the component mounts
    startNotificationsPolling(5000); // Poll every 5 seconds (adjust the interval as needed)
    // Stop polling when the component unmounts
    return () => {
      stopNotificationsPolling();
    };
  }, [startNotificationsPolling, stopNotificationsPolling]);

  const handleMarkAsRead = (notification) => {
    //update the previous state
    notifications.set((prevState) => {
      prevState.forEach((notfObj) => {
        if (notfObj.notification.id === notification.notification.id) {
          notfObj.isRead = true;
          return notfObj;
        } else return notfObj;
      });
      return prevState;
    });
    //send mark as read mutation
    markAsReadNotification({
      variables: {
        notificationId: notification.notification.id,
        userId: user!.value!.uid,
      },
    });
  };

  return (
    <Box height='100vh'>
      <Grid
        templateAreas={`"header"
                    "content"`}
        gridTemplateRows={"75px 1fr"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          {/* <Flex> */}
          <Text fontSize='h2' fontWeight='semibold' lineHeight='35px'>
            Notifications
          </Text>
          {/* </Flex> */}
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          {notificationsLoading ? (
            <Box
              padding='6'
              boxShadow='lg'
              bg='greys.400'
              width='100%'
              minH='235px'
              maxH='235px'
              borderRadius='4px'
            >
              <SkeletonCircle
                size='10'
                startColor='greys.200'
                endColor='greys.600'
              />
              <SkeletonText
                mt='4'
                noOfLines={5}
                spacing='4'
                skeletonHeight='5'
              />
            </Box>
          ) : (
            <Card variant='outline' style={mainCardStyle}>
              <CardBody padding='16px'>
                <Tabs colorScheme='black'>
                  <TabList>
                    <Tab>
                      All
                      <Badge
                        background={"black"}
                        variant='solid'
                        ml={3}
                        borderRadius='full'
                        padding='2px 12px 2px 12px'
                      >
                        {
                          notifications
                            .get()
                            .filter((notification) => !notification.isRead)
                            .length
                        }
                      </Badge>
                    </Tab>
                    <Tab>
                      Appointments
                      <Badge
                        background={"red.700"}
                        variant='solid'
                        ml={3}
                        borderRadius='full'
                        padding='2px 12px 2px 12px'
                      >
                        {
                          notifications
                            .get()
                            .filter(
                              (notification) =>
                                (notification.notification.type ===
                                  "APPT_CREATED" ||
                                  notification.notification.type ===
                                    "APPT_CHANGE" ||
                                  notification.notification.type ===
                                    "APPT_CANCELED") &&
                                !notification.isRead
                            ).length
                        }
                      </Badge>
                    </Tab>
                    <Tab>
                      Orders
                      <Badge
                        background={"green.700"}
                        variant='solid'
                        ml={3}
                        borderRadius='full'
                        padding='2px 12px 2px 12px'
                      >
                        {
                          notifications
                            .get()
                            .filter(
                              (notification) =>
                                (notification.notification.type ===
                                  "ORDER_PLACED" ||
                                  notification.notification.type ===
                                    "ORDER_CHANGED" ||
                                  notification.notification.type ===
                                    "ORDER_COMPLETED") &&
                                !notification.isRead
                            ).length
                        }
                      </Badge>
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      {notifications.get().length > 0 ? (
                        notifications.get().map((notification, index) => (
                          <Box key={index}>
                            <Flex
                              key={notification.notification.id}
                              width='100%'
                              margin='12px'
                              gap={4}
                              onClick={() => handleMarkAsRead(notification)}
                            >
                              <Center>
                                <Box width='12px'>
                                  {notification.isRead === false && (
                                    <GoDotFill />
                                  )}
                                </Box>
                                <Avatar
                                  marginLeft='12px'
                                  name={notification.notification.type}
                                  color='white'
                                  bg={(() => {
                                    switch (notification.notification.type) {
                                      case "APPT_CREATED":
                                      case "APPT_CHANGE":
                                      case "APPT_CANCELED":
                                        return "red.700";
                                      case "ORDER_PLACED":
                                      case "ORDER_CHANGED":
                                      case "ORDER_COMPLETED":
                                        return "green.700";
                                      case "URGENT_MESSAGE":
                                        return "orange.400";
                                      case "PAYMENT_FAILED":
                                      case "PAYMENT_SUCCESS":
                                        return "blue.300";
                                      default:
                                        return "black";
                                    }
                                  })()}
                                  size='sm'
                                ></Avatar>
                              </Center>
                              <Center>
                                <VStack width='100%' spacing={1}>
                                  <HStack width='100%' spacing={3}>
                                    <Text as='b'>
                                      {notification.notification.createdBy}
                                    </Text>
                                    <Text>
                                      {notification.notification.content}
                                    </Text>
                                  </HStack>
                                  <Box width='100%'>
                                    <Text fontSize='xs' color='gray.500'>
                                      {moment(
                                        notification.notification.timestamp
                                      ).fromNow()}
                                    </Text>
                                  </Box>
                                </VStack>
                              </Center>
                            </Flex>
                            <Divider width='100%' opacity={1} />
                          </Box>
                        ))
                      ) : (
                        <Center paddingTop='12px'>
                          <Text>No notifications found.</Text>
                        </Center>
                      )}
                    </TabPanel>
                    <TabPanel>
                      {notifications.get().length > 0 ? (
                        notifications
                          .get()
                          .filter(
                            (notification) =>
                              notification.notification.type ===
                                "APPT_CREATED" ||
                              notification.notification.type ===
                                "APPT_CHANGE" ||
                              notification.notification.type === "APPT_CANCELED"
                          )
                          .map((notification, index) => (
                            <Box key={index}>
                              <Flex
                                key={notification.notification.id}
                                width='100%'
                                margin='12px'
                                gap={4}
                                onClick={() => handleMarkAsRead(notification)}
                              >
                                <Center>
                                  <Box width='12px'>
                                    {notification.isRead === false && (
                                      <GoDotFill />
                                    )}
                                  </Box>
                                  <Avatar
                                    marginLeft='12px'
                                    name={notification.notification.type}
                                    color='white'
                                    bg='red.700'
                                    size='sm'
                                  ></Avatar>
                                </Center>
                                <Center>
                                  <VStack width='100%' spacing={1}>
                                    <HStack width='100%' spacing={3}>
                                      <Text as='b'>
                                        {notification.notification.createdBy}
                                      </Text>
                                      <Text>
                                        {notification.notification.content}
                                      </Text>
                                    </HStack>
                                    <Box width='100%'>
                                      <Text fontSize='xs' color='gray.500'>
                                        {moment(
                                          notification.notification.timestamp
                                        ).fromNow()}
                                      </Text>
                                    </Box>
                                  </VStack>
                                </Center>
                              </Flex>
                              <Divider width='100%' opacity={1} />
                            </Box>
                          ))
                      ) : (
                        <Center paddingTop='12px'>
                          <Text>No notifications found.</Text>
                        </Center>
                      )}
                    </TabPanel>
                    <TabPanel>
                      {notifications.get().length > 0 ? (
                        notifications
                          .get()
                          .filter(
                            (notification) =>
                              notification.notification.type ===
                                "ORDER_PLACED" ||
                              notification.notification.type ===
                                "ORDER_CHANGED" ||
                              notification.notification.type ===
                                "ORDER_COMPLETED"
                          )
                          .map((notification, index) => (
                            <Box key={index}>
                              <Flex
                                key={notification.notification.id}
                                width='100%'
                                margin='12px'
                                gap={4}
                                onClick={() => handleMarkAsRead(notification)}
                              >
                                <Center>
                                  <Box width='12px'>
                                    {notification.isRead === false && (
                                      <GoDotFill />
                                    )}
                                  </Box>
                                  <Avatar
                                    marginLeft='12px'
                                    name={notification.notification.type}
                                    color='white'
                                    bg='green.700'
                                    size='sm'
                                  ></Avatar>
                                </Center>
                                <Center>
                                  <VStack width='100%' spacing={1}>
                                    <HStack width='100%' spacing={3}>
                                      <Text as='b'>
                                        {notification.notification.createdBy}
                                      </Text>
                                      <Text>
                                        {notification.notification.content}
                                      </Text>
                                    </HStack>
                                    <Box width='100%'>
                                      <Text fontSize='xs' color='gray.500'>
                                        {moment(
                                          notification.notification.timestamp
                                        ).fromNow()}
                                      </Text>
                                    </Box>
                                  </VStack>
                                </Center>
                              </Flex>
                              <Divider width='100%' opacity={1} />
                            </Box>
                          ))
                      ) : (
                        <Center paddingTop='12px'>
                          <Text>No notifications found.</Text>
                        </Center>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          )}
        </GridItem>
      </Grid>
    </Box>
  );
}

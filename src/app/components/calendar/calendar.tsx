/* eslint-disable no-console */
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "@toast-ui/calendar/dist/toastui-calendar.css";
import "./calendar.css";

import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";

import type {
  EventObject,
  ExternalEventTypes,
  Options,
} from "@toast-ui/calendar";
import { TZDate } from "@toast-ui/calendar";
import type { ChangeEvent, MouseEvent } from "react";

import Calendar from "@toast-ui/react-calendar";
import { theme } from "./theme";

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Divider,
  VStack,
  Stack,
  Text,
  Button,
  Select,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Textarea,
  Skeleton,
  FormControl,
  FormLabel,
  CircularProgress,
  Flex,
} from "@chakra-ui/react";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useFirebaseAuth } from "../../auth";
import { useMutation, useLazyQuery } from "@apollo/client";
import {
  CreateAppointment,
  UpdateAppointment,
  DeleteAppointment,
  GetCalendarInfo,
  CreateReminder,
} from "../../../apollo/appointmentQueries";
import { Appointment } from "../../../apollo/gql-types/graphql";
import { AddIcon } from "@chakra-ui/icons";
import moment from "moment";
import { MdArrowDropDown } from "react-icons/md";
import { AutoCompleteInput } from "../autocomplete";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../constants";
import { UserPermissions } from "../../routes/permissionGuard";
import Swal from "sweetalert2";

type ViewType = "month" | "week" | "day";

const today = new TZDate();
const viewModeOptions = [
  {
    title: "Monthly",
    value: "month",
  },
  {
    title: "Weekly",
    value: "week",
  },
  {
    title: "Daily",
    value: "day",
  },
];

function appointmentToEvent(appointment: Partial<Appointment>): EventObject {
  return {
    id: appointment.id,
    title: appointment.title,
    body: appointment.description,
    start: appointment.startTime,
    end: appointment.endTime,
    calendarId: "1",

    // place the properties that don't map directly to the event object into the "raw" property field
    raw: {
      orgId: appointment.orgId,
      clientId: appointment.clientId,
      userId: appointment.userId,
      locationId: appointment.locationId,
      isInternal: appointment.isInternal,
    },
  };
}

export function MyCalendar({ view }: { view: ViewType }) {
  // get the currently signed in user
  // const { user } = useFirebaseAuth && useFirebaseAuth();
  const user = useHookstate(globalState.user);
  const { userPermissions } = useContext(UserPermissions);

  const [getCalendarInfo, { loading, error, data }] = useLazyQuery(
    GetCalendarInfo,
    {
      variables: { orgId: user.value?.organization?.id },
    }
  );

  const [clients, setClients] = useState([]);
  const [locations, setLocations] = useState([]);
  const [appointments, setAppointments] = useState([]);

  function splitList<T>(list: T[], predicate: (item: T) => boolean) {
    let a: T[] = [];
    let b: T[] = [];
    for (const item of list) {
      (predicate(item) ? a : b).push(item);
    }
    return [a, b];
  }

  /**
   * Resync the appointments, locations and clients data from our api
   */
  function refreshData() {
    const cal = getCalInstance();
    getCalendarInfo()
      .then((response) => {
        // remove all events in the calendar (this handles cases where modifications & delete's can happen behind the scenes)
        cal?.clear();

        // extract models from our query
        setAppointments(response.data?.organizations.lookup.appointments || []);
        setClients(response.data?.organizations.lookup.clients || []);
        setLocations(response.data?.organizations.lookup.locations || []);

        // insert all events into the calendar
        const newEvents: EventObject[] = (
          response.data?.organizations.lookup.appointments || []
        ).map(appointmentToEvent);
        cal.createEvents(newEvents);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // initialize the calendar on component mount
  useEffect(() => {
    refreshData();
  }, []);

  const calendarRef = useRef<typeof Calendar>(null);
  const [selectedDateRangeText, setSelectedDateRangeText] = useState("");
  const [selectedView, setSelectedView] = useState(view);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDates, setSelectedDates] = useState<EventObject | null>(null);

  function onOpenDrawer(event: EventObject) {
    setSelectedDates(event);
    onOpen();
  }

  function onCloseDrawer() {
    setSelectedDates(null);
    onClose();
  }

  const initialCalendars: Options["calendars"] = [
    {
      id: "0",
      name: "Private",
      backgroundColor: "#9e5fff",
      borderColor: "#9e5fff",
      dragBackgroundColor: "#9e5fff",
    },
    {
      id: "1",
      name: "Company",
      backgroundColor: "#00a9ff",
      borderColor: "#00a9ff",
      dragBackgroundColor: "#00a9ff",
    },
  ];

  // @ts-ignore
  const getCalInstance = useCallback(
    () => calendarRef.current?.getInstance?.(),
    []
  );

  const updateRenderRangeText = useCallback(() => {
    const calInstance = getCalInstance();
    if (!calInstance) {
      setSelectedDateRangeText("");
    }

    const viewName = calInstance.getViewName();
    const calDate = calInstance.getDate();
    const rangeStart = calInstance.getDateRangeStart();
    const rangeEnd = calInstance.getDateRangeEnd();

    const year = calDate.getFullYear();
    const monthName = calDate.d.d.toLocaleString("default", { month: "short" });
    const startDate = calDate.getDate();
    let endDate;
    let dateRangeText;

    switch (viewName) {
      case "month": {
        dateRangeText = `${monthName} ${year}`;
        break;
      }
      case "week": {
        endDate = rangeEnd.getDate();

        const startMonthName = rangeStart.d.d.toLocaleString("default", {
          month: "short",
        });
        const endMonthName = rangeEnd.d.d.toLocaleString("default", {
          month: "short",
        });

        if (startMonthName === endMonthName) {
          dateRangeText = `${startMonthName} ${rangeStart.d.d.getDate()}-${endDate}, ${year}`;
        } else {
          dateRangeText = `${startMonthName} ${rangeStart.d.d.getDate()} - ${endMonthName} ${endDate}, ${year}`;
        }
        break;
      }
      default:
        dateRangeText = `${monthName} ${startDate}, ${year}`;
    }

    setSelectedDateRangeText(dateRangeText);
  }, [getCalInstance]);

  useEffect(() => {
    setSelectedView(view);
  }, [view]);

  useEffect(() => {
    updateRenderRangeText();
  }, [selectedView, updateRenderRangeText]);

  const onAfterRenderEvent: ExternalEventTypes["afterRenderEvent"] = (res) => {
    console.group("onAfterRenderEvent");
    console.log("Event Info : ", res.title);
    console.groupEnd();
  };

  const onChangeSelect = (ev: ChangeEvent<HTMLSelectElement>) => {
    setSelectedView(ev.target.value as ViewType);
  };

  const onClickDayName: ExternalEventTypes["clickDayName"] = (res) => {
    console.group("onClickDayName");
    console.log("Date : ", res.date);
    console.groupEnd();
  };

  const onClickNavigate = (action: "today" | "prev" | "next") => {
    getCalInstance()[action]();
    updateRenderRangeText();
  };

  const onClickEvent: ExternalEventTypes["clickEvent"] = (res) => {
    onOpenDrawer(res.event);
  };

  const onClickTimezonesCollapseBtn: ExternalEventTypes["clickTimezonesCollapseBtn"] =
    (timezoneCollapsed) => {
      console.group("onClickTimezonesCollapseBtn");
      console.log("Is Timezone Collapsed?: ", timezoneCollapsed);
      console.groupEnd();

      const newTheme = {
        "week.daygridLeft.width": "100px",
        "week.timegridLeft.width": "100px",
      };
      getCalInstance().setTheme(newTheme);
    };

  const onSelectDateTime: ExternalEventTypes["onSelectDateTime"] = (
    event: EventObject
  ) => {
    onOpenDrawer(event);
  };

  const mainCardStyle = {
    padding: "0",
    marginTop: "10px",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };

  // if (!user) {
  //   return <></>;
  // }
  console.log("appointmenrs", appointments);

  return (
    <>
      {selectedDates && (
        <DrawerExample
          event={selectedDates}
          clients={clients}
          isOpen={
            userPermissions.fullAccess ||
            userPermissions.create ||
            userPermissions.edit
              ? isOpen
              : false
          }
          onOpen={onOpen}
          onClose={() => onCloseDrawer()}
          getCalInstance={getCalInstance}
          setAppointments={setAppointments}
          appointments={appointments}
        />
      )}
      <Flex>
        <Flex flexDirection={"column"} width='350px'>
          <Flex
            width={"100%"}
            alignItems='center'
            backgroundColor='gray.100'
            padding={"8px"}
          >
            <Text fontSize='lg' as='b'>
              {selectedDateRangeText}
            </Text>
          </Flex>

          <VStack>
            {/* <Card variant='outline' style={{...mainCardStyle, marginTop: 10}}>
              <CardHeader padding='8px'>
                <Text fontSize='h6' fontWeight='semibold'>
                  Tags
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />
            </Card> */}

            <Card
              variant='outline'
              style={{ ...mainCardStyle, marginTop: 0, borderRadius: 0 }}
            >
              <CardHeader padding='8px'>
                <Text fontSize='h6' fontWeight='semibold'>
                  Upcoming Appointments
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />

              <CardBody className='hide-scrollbar'>
                {loading ? (
                  <Stack>
                    <Skeleton className='mt-2' height='70px' />
                    <Skeleton className='mt-2' height='70px' />
                    <Skeleton className='mt-2' height='70px' />
                    <Skeleton className='mt-2' height='70px' />
                    <Skeleton className='mt-2' height='70px' />
                    <Skeleton className='mt-2' height='70px' />
                  </Stack>
                ) : (
                  sortEventsByTime(appointments)
                    // .filter(
                    //   (appointment) =>
                    //     new Date(appointment.startTime) >= new Date()
                    // )
                    .slice(0, 10)
                    .map((appointment) => (
                      <Card
                        variant='outline'
                        style={mainCardStyle}
                        key={appointment.clientId}
                      >
                        <CardHeader padding='8px'>
                          <Text fontSize='h7' fontWeight='semibold'>
                            {appointment.title}
                          </Text>
                          <Text fontWeight='regular'>
                            {clients.find(
                              (client) => client.id === appointment.clientId
                            )?.fullname || "N/A"}
                          </Text>
                          <Text fontWeight='regular'>
                            {new Date(
                              appointment.startTime
                            ).toLocaleDateString()}
                          </Text>
                          <Text fontWeight='regular'>
                            {moment(appointment.startTime).format("h:mm a")} -{" "}
                            {moment(appointment.endTime).format("h:mm a")}
                          </Text>
                        </CardHeader>
                      </Card>
                    ))
                )}
              </CardBody>
            </Card>
          </VStack>
        </Flex>

        <Flex flexDirection={"column"} width={"100%"}>
          <Flex
            alignItems={"center"}
            justifyContent={"space-between"}
            backgroundColor='gray.100'
            style={{ height: 43 }}
          >
            <Select
              size={"sm"}
              onChange={onChangeSelect}
              width={150}
              value={selectedView}
              backgroundColor='white'
            >
              {viewModeOptions.map((option, index) => (
                <option value={option.value} key={index}>
                  {option.title}
                </option>
              ))}
            </Select>

            <Flex>
              <Button
                variant='outline'
                size={"sm"}
                onClick={() => onClickNavigate("prev")}
                backgroundColor='white'
              >
                <FaChevronLeft />
              </Button>
              <Button
                variant='outline'
                size={"sm"}
                onClick={() => onClickNavigate("today")}
                backgroundColor='white'
              >
                Today
              </Button>

              <Button
                variant='outline'
                size={"sm"}
                onClick={() => onClickNavigate("next")}
                backgroundColor='white'
              >
                <FaChevronRight />
              </Button>
            </Flex>

            <Button
              variant='outline'
              size={"sm"}
              onClick={() => !loading && refreshData()}
              backgroundColor='white'
            >
              {loading ? (
                <CircularProgress
                  size='20px'
                  thickness='15px'
                  color='green.300'
                  isIndeterminate
                />
              ) : (
                "Refresh"
              )}
            </Button>
          </Flex>

          <Box className='no-container-padding'>
            <Calendar
              className='test-class'
              calendars={initialCalendars}
              month={{ startDayOfWeek: 1 }}
              template={{
                milestone(event) {
                  return `<span style="color: #fff; background-color: ${event.backgroundColor};">${event.title}</span>`;
                },
                allday(event) {
                  return `[All day] ${event.title}`;
                },
              }}
              theme={theme}
              // timezone={{
              //   zones: [
              //     {
              //       timezoneName: 'America/New_York',
              //       displayLabel: 'EST',
              //       tooltip: 'UTC-5:00',
              //     },
              //     {
              //       timezoneName: 'Asia/Seoul',
              //       displayLabel: 'Seoul',
              //       tooltip: 'UTC+09:00',
              //     },
              //     {
              //       timezoneName: 'Pacific/Guam',
              //       displayLabel: 'Guam',
              //       tooltip: 'UTC+10:00',
              //     },
              //   ],
              // }}
              useDetailPopup={false}
              useFormPopup={false}
              view={selectedView}
              week={{
                showTimezoneCollapseButton: true,
                timezonesCollapsed: false,
                eventView: true,
                taskView: false,
              }}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              ref={calendarRef}
              onAfterRenderEvent={onAfterRenderEvent}
              onClickDayname={onClickDayName}
              onClickEvent={onClickEvent}
              onClickTimezonesCollapseBtn={onClickTimezonesCollapseBtn}
              onSelectDateTime={onSelectDateTime}
            />
          </Box>
        </Flex>
      </Flex>
    </>
  );
}

function sortEventsByTime(events) {
  // Sort events by start time
  events.sort((a, b) => {
    return moment(a.startTime) - moment(b.startTime);
  });

  // Sort events with same start time by end time
  events.sort((a, b) => {
    if (moment(a.startTime).isSame(b.startTime)) {
      return moment(a.endTime) - moment(b.endTime);
    }
    return 0;
  });

  return events;
}

function DrawerExample({
  event,
  isOpen,
  onOpen,
  onClose,
  getCalInstance,
  clients,
  setAppointments,
  appointments,
}) {
  const locations = [
    {
      id: "111",
      address: "123 main street",
    },
    {
      id: "222",
      address: "455 other street",
    },
  ];

  // get the currently signed in user
  const stateUser = useHookstate(globalState.user);
  const { userPermissions } = useContext(UserPermissions);

  const userProfile = {
    user_id: stateUser.value?.uid,
    org_id: stateUser.value?.organization?.id,
    location_id: stateUser.value?.storeLocId,
    // client_id: "abfca775-9617-4d29-8026-965757e6f1b0"
  };

  // setup the helper function to create appointments in our backend
  const [createAppointment, createStatus] = useMutation(CreateAppointment);
  // setup the helper function to update appointments in our backend
  const [updateAppointment, updateStatus] = useMutation(UpdateAppointment);
  // setup the helper function to update appointments in our backend
  const [deleteAppointment, deleteStatus] = useMutation(DeleteAppointment);
  // send reminders
  const [sendReminder, sendReminderStatus] = useMutation(CreateReminder);

  const isCreateMode = event?.id == undefined;

  const header = !isCreateMode ? "Update Appointment" : "New Appointment";

  const [end, setEnd] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [client, setClient] = useState();
  const [location, setLocation] = useState(locations[0]);
  const navigate = useNavigate();
  function formatDate(date: Date | TZDate | null) {
    if (!date) {
      return null;
    } else if (date instanceof Date) {
      return moment(date).format("YYYY-MM-DDTHH:mm");
    } else {
      return moment(date.d.d).format("YYYY-MM-DDTHH:mm");
    }
  }

  function close() {
    getCalInstance().clearGridSelections();
    onClose();
  }

  function deleteEvent() {
    const { id, calendarId } = event;

    setAppointments(appointments.filter((appt) => appt.id !== id));
    getCalInstance().deleteEvent(id, calendarId);
    deleteAppointment({
      variables: {
        appointmentId: id,
      },
    });
    getCalInstance().clearGridSelections();
    onClose();
  }

  function updateEvent() {
    let appointment: Partial<Appointment> = {
      id: event?.id,
      title: title || "",
      description: description || "",
      startTime: new Date(start),
      endTime: new Date(end),

      // inputs we need to add ourselves
      clientId: client?.id,
      orgId: userProfile.org_id,
      userId: userProfile.user_id,
      locationId: userProfile.location_id,
      isInternal: true,
    };

    setAppointments(
      appointments.map((appt) => {
        if (appt.id === appointment.id) {
          return appointment;
        } else {
          return appt;
        }
      })
    );

    let targetEvent = appointmentToEvent(appointment);
    getCalInstance().updateEvent(event.id, event.calendarId, targetEvent);
    updateAppointment({
      variables: {
        updatedBy: user!.uid,
        appointment: appointment,
      },
    });
  }

  function createEvent() {
    const appointment: Partial<Appointment> = {
      // inputs from the event object
      id: uuidv4(),
      title: title || "",
      description: description || "",
      startTime: new Date(start),
      endTime: new Date(end),

      // inputs we need to add ourselves
      clientId: client?.id,
      orgId: userProfile.org_id,
      userId: userProfile.user_id,
      locationId: userProfile.location_id,
      isInternal: true,
    };

    setAppointments([...appointments, appointment]);
    // remapping this type to EventObject sets the 'raw' data properties from the Appointment object
    const newEvent: EventObject = appointmentToEvent(appointment);
    getCalInstance().createEvents([newEvent]);
    createAppointment({
      variables: {
        createdBy: userProfile.user_id || "SYSTEM",
        appointment: {
          ...appointment,
        },
      },
      onCompleted: (res) => {
        console.log("res", res);
        if (res.appointments.create === true) {
          sendReminder({
            variables: {
              orgId: userProfile.org_id,
              reminder: {
                receiverNo: client.phoneNumber,
                messageBody: `
                            <p>${title}</p>
                            <p> StartDate and Time: ${moment(start).format(
                              "MMMM Do YYYY"
                            )}</p>
                            <p>Location:  ${location.address}</p>
                            <p>Dear Client, this is a reminder for your upcoming appointment.</p>
                            <p>Please make sure to arrive on time.</p>
                            <p>Thank you!</p>
                          `,
                appointmentStartTime: start,
              },
            },
          });
        }
      },
    });
  }

  function submit() {
    if (!start || !end) {
      return;
    }
    if (isCreateMode) {
      createEvent();
    } else {
      updateEvent();
    }

    getCalInstance().clearGridSelections();
    onClose();
  }

  // only insert the value into our state if the event object changes
  useEffect(() => {
    setStart(formatDate(event?.start));
    setEnd(formatDate(event?.end));
    setTitle(event?.title);
    setDescription(event?.body);
    setClient(clients.find((client) => client.id === event?.raw?.clientId));
  }, [event]);

  const handleClientView = () => {
    if (client) {
      navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.CLIENT_VIEW}`, {
        state: client,
      });
    }
  };

  return (
    <>
      <Drawer onClose={() => close()} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{header}</DrawerHeader>
          <DrawerBody>
            <VStack width={"100%"}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder='Enter a title'
                  type='text'
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Client</FormLabel>
                <AutoCompleteInput
                  placeholder="Enter a Client's name"
                  selected={client}
                  options={clients}
                  getValue={(client) => client?.fullname}
                  onSelect={(client) => setClient(client)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Select
                  icon={<MdArrowDropDown />}
                  value={location.address}
                  onChange={(e) =>
                    setLocation(
                      locations.find((loc) => loc.address === e.target.value)
                    )
                  }
                >
                  {locations.map((location, index) => (
                    <option key={index}>{location.address}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel htmlFor='datetime-local'>Start Time</FormLabel>
                <Input
                  placeholder='Select Date and Time'
                  size='md'
                  type='datetime-local'
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel htmlFor='datetime-local'>End Time</FormLabel>
                <Input
                  placeholder='Select Date and Time'
                  size='md'
                  type='datetime-local'
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder='Enter a description here'
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </FormControl>

              {!isCreateMode && (
                <Box>
                  <Button
                    color='red'
                    variant='outline'
                    className='float-end'
                    onClick={() => deleteEvent()}
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.delete
                        ? false
                        : true
                    }
                  >
                    Delete
                  </Button>
                </Box>
              )}
              <Box>
                <Button variant='outline' onClick={handleClientView}>
                  View Client Details
                </Button>
              </Box>
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth='1px'>
            <Button variant='outline' mr={3} onClick={() => close()}>
              Cancel
            </Button>
            {isCreateMode ? (
              <Button
                rightIcon={<AddIcon boxSize={3} />}
                colorScheme='blue'
                onClick={() => submit()}
              >
                Create
              </Button>
            ) : (
              <Button colorScheme='blue' onClick={() => submit()}>
                Update
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  VStack,
  Text,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { LabeledInput } from "../shared/labeledInput";
import { AppointmentDetails, ClientDetails } from "../interfaces";
import { SelectDropdown } from "../shared/selectDropdown";
import { useMutation, useQuery } from "@apollo/client";
import { GetAllClients } from "../../../apollo/clientQueries";
import { CreateAppointment } from "../../../apollo/appointmentQueries";
import { v4 as uuidv4 } from "uuid";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import Swal from "sweetalert2";

export const AddAppointment = (props: { GetAppointmentRefetch? }) => {
  const { GetAppointmentRefetch } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userState = useHookstate(globalState.user);

  const [clientId, setClientid] = useState("");
  const [orgId, setOrgId] = useState("");
  const [clientLocId, setClientLocId] = useState("");
  const [clientDetailsState, setClientDetails] = useState<ClientDetails[]>([]);

  const [appointmentDetails, setAppointmentDetails] =
    useState<AppointmentDetails>({
      title: "",
      clientId: "",
      startTime: "",
      endTime: "",
      description: "",
    });

  const {
    loading: clientLoading,
    error: clientError,
    data: clientDetails,
  } = useQuery(GetAllClients);

  const [Appointment, CreateAppointmentResponse] =
    useMutation(CreateAppointment);

  useEffect(() => {
    if (clientDetails) {
      const formattedData = clientDetails.clients.getClients.map((ele) => ({
        id: ele.id,
        fullname: ele.fullname,
        phoneNumber: ele.phoneNumber,
        email: ele.email,
        locId: ele.locId,
        orgId: ele.orgId,
      }));
      setClientDetails(formattedData);
    }
  }, [clientDetails]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAppointmentDetails({
      ...appointmentDetails,
      [event.target.name]: event.target.value,
    });
  };
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    Appointment({
      variables: {
        createdBy: userState.value?.uid,
        appointment: {
          id: uuidv4(),
          orgId: orgId,
          locationId: clientLocId,
          description: appointmentDetails.description,
          clientId: clientId,
          startTime: appointmentDetails.startTime,
          endTime: appointmentDetails.endTime,
          title: appointmentDetails.title,
          isInternal: false,
          userId: userState.value?.uid,
        },
      },
      onCompleted: (res) => {
        onClose();
        GetAppointmentRefetch({
          variables: {
            clientId: clientId,
          },
        });
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Appointment created successfully",
        });
      },
    });
  };

  return (
    <>
      <Button size='sm' leftIcon={<AddIcon />} onClick={onOpen}>
        Add Appointment
      </Button>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size={"xs"}>
        <DrawerOverlay />
        <form onSubmit={handleSubmit}>
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader
              borderBottomWidth='1px'
              padding='16px 24px'
              borderColor='greys.300'
            >
              <Text fontSize='h6' fontWeight='semibold' lineHeight='22px'>
                New Appointment
              </Text>
            </DrawerHeader>

            <DrawerBody padding='16px 24px'>
              <VStack spacing='8px' width='100%' alignItems='flex-start'>
                <LabeledInput
                  containerHeight='55px'
                  label='Title'
                  labelSize='p5'
                  placeholder='Title...'
                  name='title'
                  required={true}
                  onChange={handleChange}
                />
                <SelectDropdown
                  containerHeight='55px'
                  labelSize='p5'
                  placeholder='Clients'
                  loading={clientLoading}
                  label='Clients'
                  options={clientDetailsState.map((client) => ({
                    label: client.fullname,
                    value: client.id,
                    locId: client.locId,
                    orgId: client.orgId,
                  }))}
                  onChange={(option) => {
                    setClientid(option.value);
                    setClientLocId(option.locId);
                    setOrgId(option.orgId);
                  }}
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Start Time'
                  labelSize='p5'
                  name='startTime'
                  required={true}
                  onChange={handleChange}
                  type='datetime-local'
                />
                <LabeledInput
                  containerHeight='55px'
                  label='End Time'
                  labelSize='p5'
                  type='datetime-local'
                  required={true}
                  onChange={handleChange}
                  name='endTime'
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Description'
                  labelSize='p5'
                  placeholder='Description...'
                  onChange={handleChange}
                  name='description'
                  required={true}
                />
              </VStack>
            </DrawerBody>
            <DrawerFooter
              borderTopWidth='1px'
              padding='16px 24px'
              borderColor='greys.300'
            >
              <Flex justifyContent='end'>
                <Button mr={4} size='sm' variant='outline'>
                  Clear
                </Button>
                <Button
                  size='sm'
                  variant='solid'
                  type='submit'
                  loadingText='Saving...'
                  isLoading={CreateAppointmentResponse.loading}
                  spinnerPlacement='start'
                >
                  Save
                </Button>
              </Flex>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    </>
  );
};

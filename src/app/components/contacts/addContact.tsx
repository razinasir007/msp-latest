import React, { useContext, useState } from "react";
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
  Checkbox,
} from "@chakra-ui/react";

import { AddIcon } from "@chakra-ui/icons";
import { LabeledInput } from "../shared/labeledInput";
import { ClientDetails } from "../interfaces";
import { CreateContact } from "../../../apollo/clientQueries";
import { useMutation } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import { AddressInput } from "../shared/addressInput";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../state/store";
import { UserPermissions } from "../../routes/permissionGuard";
import { SendEmail } from "../../../apollo/userQueries";
import { appConfig } from "../../../config";
import { EncryptData } from "../../../constants";

export function AddContact(props: { GetAllClientsRefetch? }) {
  const { userPermissions } = useContext(UserPermissions);
  const { GetAllClientsRefetch } = props;
  const user = useHookstate(globalState.user);
  const [SendSignUpUrl, SendSignUpUrlResponse] = useMutation(SendEmail);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isChecked, setIsChecked] = useState(false);
  const [ClientDetails, setClientDetails] = useState<ClientDetails>({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    mailAddress: "",
    billingAddress: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClientDetails({
      ...ClientDetails,
      [event.target.name]: event.target.value,
    });
  };

  const [
    CreateClient,
    {
      loading: createContactLoading,
      error: createConatctError,
      data: createContactData,
    },
  ] = useMutation(CreateContact);

  const clear = () => {
    setClientDetails({
      firstname: "",
      lastname: "",
      email: "",
      phoneNumber: "",
      mailAddress: "",
      billingAddress: "",
    });
  };

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    let userID = uuidv4();
    CreateClient({
      variables: {
        createdBy: user!.value?.uid,
        client: {
          firstname: ClientDetails.firstname,
          lastname: ClientDetails.lastname,
          email: ClientDetails.email,
          phoneNumber: ClientDetails.phoneNumber,
          billingAddress: isChecked
            ? ClientDetails.mailAddress
            : ClientDetails.billingAddress,
          lastContactedAt: ClientDetails.lastContactedAt,
          mailAddress: ClientDetails.mailAddress,
          orgId: user!.value?.organization?.id,
          locId: "ca8ecd84-7181-4dc2-a622-c323e28edc95",
          // zone: ClientDetails.zone,
          // country: ClientDetails.country,
          id: userID,
        },
      },
      onCompleted: (res) => {
        if (res.clients.createClient === true) {
          SendSignUpUrl({
            variables: {
              email: {
                email: ClientDetails.email,
                subject: "Sign Up",
                content: `
                        <html>
                        <body>
                          <p>Dear ${ClientDetails.firstname},</p>
    
                          <p>You can now sign up to MyStudioPro.</p>
    
                          <p>Use the following link to sign up to MyStudioPro.</p>
  
                          <p>${
                            appConfig.FRONTEND_URL
                          }/signUp?client=${true}&clientEmail=${
                  ClientDetails.email
                }</p>
    
                          <p>Thank you !</p>
    
                          <p>Sincerely,</p>
                          <p>MyStudio Pro</p>
                        </body>
                      </html>
      `,
              },
            },
            onCompleted: (res) => {
              if (res.emails.send === true) {
                GetAllClientsRefetch();
                onClose();
                Swal.fire({
                  icon: "success",
                  title: "Created",
                  text: "Contact created successfully",
                });
              }
            },
          });
        } else {
          onClose();
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        }
      },
    });
  };

  function handleLocationChange(location, parsedLocation) {
    ClientDetails.billingAddress = location.label;
    ClientDetails.parsedLocation = parsedLocation;
    setClientDetails({ ...ClientDetails });
  }

  function handleMailLocation(location, parsedLocation) {
    ClientDetails.mailAddress = location.label;
    ClientDetails.parsedLocation = parsedLocation;
    setClientDetails({ ...ClientDetails });
  }
  return (
    <>
      <Button
        size='sm'
        leftIcon={<AddIcon />}
        onClick={onOpen}
        isDisabled={
          userPermissions.fullAccess || userPermissions.create ? false : true
        }
      >
        Add Contacts
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
                Add Contact
              </Text>
            </DrawerHeader>

            <DrawerBody padding='16px 24px'>
              <VStack spacing='8px' width='100%' alignItems='flex-start'>
                <Text fontSize='h6' fontWeight='semibold' lineHeight='22px'>
                  Contact Information
                </Text>
                <LabeledInput
                  containerHeight='55px'
                  label='First Name'
                  labelSize='p5'
                  placeholder='First Name...'
                  name='firstname'
                  required={true}
                  value={ClientDetails.firstname}
                  onChange={handleChange}
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Last Name'
                  labelSize='p5'
                  placeholder='Last Name...'
                  name='lastname'
                  required={true}
                  value={ClientDetails.lastname}
                  onChange={handleChange}
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Email'
                  labelSize='p5'
                  placeholder='Email...'
                  name='email'
                  required={true}
                  value={ClientDetails.email}
                  type='email'
                  onChange={handleChange}
                />
                <LabeledInput
                  containerHeight='55px'
                  label='Phone Number'
                  labelSize='p5'
                  type='number'
                  required={true}
                  value={ClientDetails.phoneNumber}
                  name='phoneNumber'
                  placeholder='Phone Number...'
                  onChange={handleChange}
                />
                <AddressInput
                  label='Mail Address'
                  labelSize='p5'
                  placeholder='Mail Address...'
                  name='mailAddress'
                  defaultValue={""}
                  // value={ClientDetails.mailAddress}
                  value={{
                    label: ClientDetails.mailAddress,
                    value: ClientDetails.mailAddress,
                  }}
                  handleLocationChange={handleMailLocation}
                />
                <Checkbox
                  size='md'
                  colorScheme='green'
                  onChange={(e) => setIsChecked(e.target.checked)}
                >
                  <Text fontSize='p6'>
                    {" "}
                    Billing address is same as mail address{" "}
                  </Text>
                </Checkbox>
                {!isChecked ? (
                  <AddressInput
                    label='Billing Address'
                    labelSize='p5'
                    placeholder='Billing Address...'
                    name='billingAddress'
                    defaultValue={""}
                    value={{
                      label: ClientDetails.billingAddress,
                      value: ClientDetails.billingAddress,
                    }}
                    handleLocationChange={handleLocationChange}
                  />
                ) : (
                  ""
                )}
              </VStack>
            </DrawerBody>
            <DrawerFooter
              borderTopWidth='1px'
              padding='16px 24px'
              borderColor='greys.300'
            >
              <Flex justifyContent='end'>
                <Button
                  mr={4}
                  size='sm'
                  variant='outline'
                  // onClick={() => setReset(!reset)}
                  onClick={clear}
                >
                  Clear
                </Button>
                <Button
                  size='sm'
                  variant='solid'
                  type='submit'
                  isLoading={createContactLoading}
                  loadingText='Saving...'
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
}

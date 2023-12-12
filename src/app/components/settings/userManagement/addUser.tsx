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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { LabeledInput } from "../../shared/labeledInput";
import { OrgUsers } from "../../interfaces";
import { InviteBatch, SendEmail } from "../../../../apollo/userQueries";
import { useMutation, useQuery } from "@apollo/client";
import { v4 as uuidv4 } from "uuid";
import { SelectDropdown } from "../../shared/selectDropdown";
import { EncryptData, StatusOptions } from "../../../../constants";
import { AssignGrantLevel } from "../../../../apollo/permissionsQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { GetOrgLocs } from "../../../../apollo/organizationQueries";
import Swal from "sweetalert2";
import { appConfig } from "../../../../config";
import { UserPermissions } from "../../../routes/permissionGuard";

export function AddUser(props: { roleOptions?: Array<object> }) {
  const { userPermissions } = useContext(UserPermissions);
  const state = useHookstate(globalState);
  const stateUser = state.user.get();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [location, setLocation] = useState({
    label: "",
    value: "",
  });
  const [newUserDetails, setNewUserDetails] = useState<OrgUsers>({
    status: StatusOptions[0],
    role: props.roleOptions
      ? props.roleOptions[1]
      : { value: null, label: null },
  });
  const {
    loading: locationLoading,
    error: locationError,
    data: locationData,
  } = useQuery(GetOrgLocs, {
    variables: { orgId: stateUser!.organization?.id },
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewUserDetails({
      ...newUserDetails,
      [event.target.name]: event.target.value,
    });
  };

  const clear = () => {
    setNewUserDetails({
      fullname: "",
      email: "",
      status: StatusOptions[0],
      role: props.roleOptions[1],
      store: "",
    });
  };
  const [
    createUserInvite,
    {
      loading: InviteUserLoading,
      error: InviteUserError,
      data: InviteUserData,
    },
  ] = useMutation(InviteBatch);

  const [SendEmailInvites, SendEmailResponse] = useMutation(SendEmail);

  const [assignGrantLevel, assignGrantLevelResponse] =
    useMutation(AssignGrantLevel);

  const handleDropDownChange = (options) => {
    if (options.value !== null) {
    }
    setLocation(options);
  };

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
        Add User
      </Button>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size={"xs"}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader
            borderBottomWidth='1px'
            padding='16px 24px'
            borderColor='greys.300'
          >
            <Text fontSize='h6' fontWeight='semibold' lineHeight='22px'>
              Add User
            </Text>
          </DrawerHeader>

          <DrawerBody padding='16px 24px'>
            <VStack spacing='8px' width='100%' alignItems='flex-start'>
              <Text fontSize='h6' fontWeight='semibold' lineHeight='22px'>
                User Information
              </Text>

              <LabeledInput
                containerHeight='55px'
                label='Email'
                labelSize='p5'
                placeholder='Email...'
                name='email'
                value={newUserDetails.email}
                onChange={handleChange}
              />
              <SelectDropdown
                value={newUserDetails.status}
                containerHeight='55px'
                label='Status'
                labelSize='p5'
                placeholder='Status...'
                options={StatusOptions}
                onChange={(selection) => {
                  setNewUserDetails({
                    ...newUserDetails,
                    ["status"]: selection,
                  });
                }}
              />
              <SelectDropdown
                value={newUserDetails.role}
                containerHeight='55px'
                label='Role'
                labelSize='p5'
                options={props.roleOptions}
                placeholder='Role...'
                onChange={(selection) => {
                  setNewUserDetails({
                    ...newUserDetails,
                    ["role"]: selection,
                  });
                }}
              />
              <SelectDropdown
                containerHeight='55px'
                label='Store'
                labelSize='p5'
                value={location}
                loading={locationLoading}
                placeholder='Locations'
                options={locationData?.organizations?.lookup?.locations.map(
                  (ele) => ({
                    label: ele.address,
                    value: ele.id,
                  })
                )}
                onChange={handleDropDownChange}
              />
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
                //   onClick={() => setReset(!reset)}
                onClick={clear}
              >
                Clear
              </Button>
              <Button
                size='sm'
                variant='solid'
                onClick={() => {
                  createUserInvite({
                    variables: {
                      createdBy: stateUser!.uid,
                      userInvitees: [
                        {
                          id: uuidv4(),
                          orgId: stateUser!.organization?.id,
                          email: newUserDetails.email,
                          // grantLvl: newUserDetails?.role?.value,
                          // grantLvl: 10,
                          roleId: newUserDetails?.role?.value,
                          storeLocId: location.value,
                        },
                      ],
                    },
                    onCompleted: (resp) => {
                      if (resp.users.inviteBatch === true) {
                        SendEmailInvites({
                          variables: {
                            email: {
                              subject: `Invitation from ${
                                stateUser!.firstname
                              } ${stateUser!.lastname} - Click to Join`,
                              email: newUserDetails.email,
                              content: `<html>
                              <body>
                                <p>Hi there,</p>
                            
                                <p>
                                  You've been invited to join MyStudioPro by ${
                                    stateUser!.firstname
                                  } ${
                                stateUser!.lastname
                              }! We're excited to have you onboard.
                                </p>
                            
                                <p>To get started, simply click on the link below:</p>
                                <p>
                                  ${appConfig.FRONTEND_URL}/signUp?email=${
                                newUserDetails.email
                              }&orgId=${EncryptData(
                                stateUser!.organization?.id
                              )}
                                </p>
                            
                                <p>We look forward to seeing you there!</p>
                            
                                <p>Best regards,</p>
                                <p>The ${stateUser!.organization?.name} Team</p>
                              </body>
                            </html>
                            `,
                            },
                          },
                        });
                        onClose();
                        Swal.fire({
                          icon: "success",
                          titleText: "Invite sent successfully",
                          text: "User invitation sent successfully",
                        });
                      } else {
                        Swal.fire({
                          icon: "error",
                          titleText: "Error sending invitations",
                          text: "Kindly try again",
                        });
                      }
                    },
                    onError: (err) => {
                      console.log("THIS IS ERROR FOR INVITE USERS", err);
                    },
                  });
                }}
                isLoading={InviteUserLoading}
                loadingText='Saving...'
                spinnerPlacement='start'
              >
                Save
              </Button>
            </Flex>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

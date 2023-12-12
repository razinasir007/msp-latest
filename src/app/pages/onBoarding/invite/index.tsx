import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Center,
  VStack,
  Text,
  Box,
  HStack,
  IconButton,
  CardHeader,
  Flex,
} from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useMutation, useQuery } from "@apollo/client";
import {
  GetGrantLevels,
  GetRolesByOrgId,
} from "../../../../apollo/permissionsQueries";
import { CreateInvite, SendEmail } from "../../../../apollo/userQueries";
import { AddRecipientDetails } from "../../../components/interfaces";
import { LabeledInput } from "../../../components/shared/labeledInput";
import { SelectDropdown } from "../../../components/shared/selectDropdown";
import Swal from "sweetalert2";
import { EncryptData } from "../../../../constants";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { appConfig } from "../../../../config";

const mainCardStyle = {
  padding: "0",
  width: "50%",
  borderRadius: "4px",
  borderColor: "#E2E8F0",
  background: "#FCFCFA",
  marginTop: "30px",
};

const Invite = (props: { orgId: string; storeLocationId: string }) => {
  const { orgId, storeLocationId } = props;
  const state = useHookstate(globalState);
  const stateUser = state.user.get();

  const [recipients, setRecipients] = useState<AddRecipientDetails[]>([
    {
      id: uuidv4(),
      orgId: stateUser!.organization?.id,
      storeLocId: stateUser?.storeLocId,
      email: "",
      // grantLvl: "",
      roleId: "",
    },
  ]);
  const [roles, setRoles] = useState([]);
  useQuery(GetRolesByOrgId, {
    variables: { orgId: stateUser!.organization?.id },
    onCompleted: (allRoles) => {
      const roleOptions =
        allRoles.dynamicRolesPermissions?.lookupRolesByOrganization.map(
          (role) => ({
            value: role.id,
            label: role.name,
          })
        );
      setRoles(roleOptions);
    },
  });

  const addRecipient = () => {
    setRecipients([
      ...recipients,
      {
        id: uuidv4(),
        orgId: stateUser!.organization?.id,
        storeLocId: stateUser?.storeLocId,
        email: "",
        // grantLvl: "",
        roleId: "",
      },
    ]);
  };

  const [CreateUsersInvite, CreateUsersInviteResp] = useMutation(CreateInvite);
  const [SendEmailInvites, SendEmailResponse] = useMutation(SendEmail);

  return (
    <Center>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader pb='8px'>
          <Flex width='100%' justifyContent='center'>
            <Text fontSize='h5' fontWeight='semibold'>
              Invite Recipients
            </Text>
          </Flex>
        </CardHeader>

        <CardBody pt='8px'>
          <VStack>
            {recipients.length > 0 ? (
              recipients.map((ele, index) => {
                return (
                  <HStack
                    w='100%'
                    height='55px'
                    justifyContent='center'
                    key={ele.id}
                  >
                    <LabeledInput
                      containerHeight='30px'
                      labelSize='p5'
                      type='email'
                      onChange={(event) => {
                        ele.email = event.target.value;
                        setRecipients([...recipients]);
                      }}
                      placeholder='Email...'
                    />
                    <Box w='200px'>
                      <SelectDropdown
                        containerHeight='30px'
                        labelSize='p5'
                        placeholder='Roles'
                        onChange={(value) => {
                          ele.roleId = value.value;
                          setRecipients([...recipients]);
                        }}
                        options={roles}
                      />
                    </Box>
                    <IconButton
                      _hover={{ backgroundColor: "transparent" }}
                      fontSize='18px'
                      variant='ghost'
                      height='fit-content'
                      aria-label='Delete recipient'
                      icon={<DeleteIcon />}
                      onClick={() => {
                        const updatedRecipients = recipients.filter(
                          (_, currentIndex) => currentIndex !== index
                        );
                        setRecipients(updatedRecipients);
                      }}
                    />
                  </HStack>
                );
              })
            ) : (
              <Text>Click the icon below to add a recipient</Text>
            )}
            <Box w='100%'>
              <IconButton
                _hover={{ backgroundColor: "transparent" }}
                variant='ghost'
                height='fit-content'
                aria-label='Add recipient'
                icon={<AddIcon />}
                onClick={addRecipient}
              />
            </Box>
          </VStack>
        </CardBody>

        <CardFooter>
          <Button
            size='sm'
            width='100%'
            isLoading={CreateUsersInviteResp.loading}
            onClick={() => {
              CreateUsersInvite({
                variables: {
                  createdBy: stateUser!.uid,
                  userInvitees: recipients,
                },
                onCompleted: (resp) => {
                  if (resp.users.inviteBatch === true) {
                    recipients.map((ele) => {
                      SendEmailInvites({
                        variables: {
                          email: {
                            subject: `Invitation from ${stateUser!.firstname} ${
                              stateUser!.lastname
                            } - Click to Join`,
                            email: ele.email,
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
                              ele.email
                            }&orgId=${EncryptData(
                              ele.orgId
                            )}&locId=${EncryptData(stateUser?.storeLocId)}
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
                    });
                    Swal.fire({
                      icon: "success",
                      titleText: "Invites sent successfully",
                      text: "User invitations sent successfully",
                      confirmButtonText: "Continue...",
                    });
                  } else {
                    Swal.fire({
                      icon: "error",
                      titleText: "Error sending invitations",
                      text: "Kindly try again",
                      confirmButtonText: "Try again",
                    });
                  }
                },
                onError: (err) => {
                  console.log("THIS IS ERROR FOR INVITE USERS", err);
                },
              });
            }}
          >
            Send Invites
          </Button>
        </CardFooter>
      </Card>
    </Center>
  );
};

export default Invite;

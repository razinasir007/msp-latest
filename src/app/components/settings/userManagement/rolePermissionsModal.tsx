import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  Checkbox,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useDisclosure,
  VStack,
  Text,
  TableContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Flex,
  Textarea,
  Box,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import React, { useContext, useEffect, useState } from "react";
import {
  CreateRole,
  // GetAllPermissions,
  GetPermissions,
  GetRolePermissions,
  UpdateRole,
} from "../../../../apollo/permissionsQueries";
import { LabeledInput } from "../../shared/labeledInput";
import { v4 as uuidv4 } from "uuid";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import Swal from "sweetalert2";
import { UserPermissions } from "../../../routes/permissionGuard";

export const RolePermissionsModal = (props) => {
  const { userPermissions } = useContext(UserPermissions);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const stateUser = useHookstate(globalState.user);

  const [permissions, setPermissions] = useState<Array<any>>([]);
  const [rolePermissions, setRolePermissions] = useState<Array<any>>([]);
  const [role, setRole] = useState({
    id: uuidv4(),
    name: "",
    description: "",
  });

  const {
    loading: permissionsLoading,
    error: permissionsError,
    data: permissionsData,
  } = useQuery(GetPermissions);

  const [createRole, { loading: createRoleLoading }] = useMutation(CreateRole);
  const [updateRole, { loading: updateRoleLoading }] = useMutation(UpdateRole);

  const [
    getRolePermissions,
    { loading: rolePermissionsLoading, data: rolePermissionsData },
  ] = useLazyQuery(GetRolePermissions);

  useEffect(() => {
    if (rolePermissionsData) {
      setRolePermissions(
        rolePermissionsData?.dynamicRolesPermissions?.lookupPermissionByRole
      );
    }
  }, [rolePermissionsData]);

  useEffect(() => {
    if (permissionsData) {
      setPermissions(
        permissionsData?.dynamicRolesPermissions?.getPermissionMapping
      );
    }
  }, [permissionsData]);

  const handleCheckboxChange = (perm, permissionVal, check) => {
    const isChecked = check;
    const permissionValue = permissionVal;
    const permissionObj = perm;
    if (isChecked) {
      if (permissionValue === permissionObj["*"]) {
        const valuesNotIncluded = Object.values(permissionObj).filter(
          (value) => !rolePermissions.includes(value)
        );
        const updatedRolePermissions = [
          ...rolePermissions,
          ...valuesNotIncluded,
        ];
        setRolePermissions(updatedRolePermissions);
      } else {
        const updatedRolePermissions = [...rolePermissions, permissionValue];
        const crud = [
          permissionObj.create,
          permissionObj.view,
          permissionObj.edit,
          permissionObj.delete,
        ];
        const allCrudPermissionsPresent = crud.every((permission) =>
          updatedRolePermissions.includes(permission)
        );
        if (allCrudPermissionsPresent) {
          const updatedRolePermissions = [
            ...rolePermissions,
            permissionObj["*"],
            permissionValue,
          ];
          setRolePermissions(updatedRolePermissions);
        } else {
          const updatedRolePermissions = [...rolePermissions, permissionValue];
          setRolePermissions(updatedRolePermissions);
        }
      }
    } else {
      if (permissionValue === permissionObj["*"]) {
        const updatedRolePermissions = rolePermissions.filter(
          (permission) => !Object.values(permissionObj).includes(permission)
        );
        setRolePermissions(updatedRolePermissions);
      } else {
        const updatedRolePermissions = rolePermissions.filter(
          (permissionData) => permissionData !== permissionVal
        );
        setRolePermissions(updatedRolePermissions);
      }
    }
  };
  return (
    <>
      {props.case === "editPermissions" ? (
        <Button
          variant='solid'
          size='sm'
          isDisabled={
            userPermissions.fullAccess || userPermissions.edit ? false : true
          }
          onClick={() => {
            if (props.role) {
              setRole(props.role);
              getRolePermissions({
                variables: {
                  id: props.role.id,
                },
              });
            }
            onOpen();
          }}
        >
          Edit Role / Permissions
        </Button>
      ) : props.case === "createNewRole" ? (
        <AddIcon
          minH='150px'
          boxSize='50px'
          onClick={() => {
            userPermissions.fullAccess || userPermissions.create
              ? onOpen()
              : Swal.fire({
                  icon: "error",
                  title: "Not Allowed",
                  text: "You are not allowed to create roles",
                });
          }}
        />
      ) : (
        <Button
          variant='solid'
          size='sm'
          onClick={onOpen}
          isDisabled={
            userPermissions.fullAccess || userPermissions.create ? false : true
          }
        >
          Add Role / Permissions
        </Button>
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered={true}
        size='full'
        scrollBehavior='inside'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {props.case === "editPermissions"
              ? `Edit ${props.role.name} Role`
              : "Create New Role"}
          </ModalHeader>
          <ModalCloseButton />
          <Divider width='100%' opacity={1} />
          <ModalBody>
            <LabeledInput
              placeholder='Type a role name...'
              label='Role'
              value={role.name}
              onChange={(event) => {
                const updatedRole = {
                  ...role,
                  name: event.target.value,
                };
                setRole(updatedRole);
              }}
            />
            <VStack w='100%' alignItems='left'>
              <Text fontSize='h7' fontWeight='semibold'>
                Description:
              </Text>
              <Textarea
                value={role.description}
                onChange={(event) => {
                  const updatedRole = {
                    ...role,
                    description: event.target.value,
                  };
                  setRole(updatedRole);
                }}
              />
            </VStack>

            {rolePermissionsLoading ? (
              <Box
                mt='8px'
                padding='6'
                boxShadow='lg'
                bg='greys.400'
                width='100%'
                h='100%'
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
              <VStack spacing='8px' alignItems='left' mt='8px'>
                <Text fontSize='h7' fontWeight='semibold'>
                  Permissions:
                </Text>
                <VStack h='100%' w='100%' alignItems='left' spacing='16px'>
                  <TableContainer>
                    <Table
                      variant='striped'
                      size='md'
                      colorScheme={"blackAlpha"}
                    >
                      <Thead>
                        <Tr>
                          <Th w='250px'>PERMISSIONS</Th>
                          <Th w='250px'>ALL ACCESS</Th>
                          <Th w='250px'>VIEW</Th>
                          <Th w='250px'>CREATE</Th>
                          <Th w='250px'>EDIT</Th>
                          <Th w='250px'>DELETE</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {Object.entries(permissions)
                          .filter(([key]) => !key.includes("settings_"))
                          .map(([key, value]) => (
                            <Tr key={key}>
                              <Td w='250px'>{key.toUpperCase()}</Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value["*"],
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={
                                    rolePermissions.includes(value["*"]) ||
                                    rolePermissions.includes(value.view)
                                  }
                                  isDisabled={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value.view,
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={
                                    rolePermissions.includes(value["*"]) ||
                                    rolePermissions.includes(value.create)
                                  }
                                  isDisabled={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value.create,
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={
                                    rolePermissions.includes(value["*"]) ||
                                    rolePermissions.includes(value.edit)
                                  }
                                  isDisabled={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value.edit,
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={
                                    rolePermissions.includes(value["*"]) ||
                                    rolePermissions.includes(value.delete)
                                  }
                                  isDisabled={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value.delete,
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <TableContainer>
                    <Table
                      variant='striped'
                      size='md'
                      colorScheme={"blackAlpha"}
                    >
                      <Thead>
                        <Tr>
                          <Th w='250px'>Settings</Th>
                          <Th w='250px' display='none'>
                            ALL ACCESS
                          </Th>
                          <Th w='250px' display='none'>
                            VIEW
                          </Th>
                          <Th w='250px' display='none'>
                            CREATE
                          </Th>
                          <Th w='250px' display='none'>
                            EDIT
                          </Th>
                          <Th w='250px' display='none'>
                            DELETE
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {Object.entries(permissions)
                          .filter(([key]) => key.includes("settings_"))
                          .map(([key, value]) => (
                            <Tr key={key}>
                              <Td w='250px'>
                                {key
                                  .replace("settings_", "")
                                  .replace(/_/g, " ")
                                  .toUpperCase()}
                              </Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value["*"],
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={
                                    rolePermissions.includes(value["*"]) ||
                                    rolePermissions.includes(value.view)
                                  }
                                  isDisabled={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value.view,
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={
                                    rolePermissions.includes(value["*"]) ||
                                    rolePermissions.includes(value.create)
                                  }
                                  isDisabled={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value.create,
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={
                                    rolePermissions.includes(value["*"]) ||
                                    rolePermissions.includes(value.edit)
                                  }
                                  isDisabled={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value.edit,
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                              <Td w='250px'>
                                <Checkbox
                                  isChecked={
                                    rolePermissions.includes(value["*"]) ||
                                    rolePermissions.includes(value.delete)
                                  }
                                  isDisabled={rolePermissions.includes(
                                    value["*"]
                                  )}
                                  onChange={(event) => {
                                    handleCheckboxChange(
                                      value,
                                      value.delete,
                                      event.target.checked
                                    );
                                  }}
                                />
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant='outline' mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              variant='solid'
              isLoading={createRoleLoading || updateRoleLoading}
              onClick={() => {
                if (props.case === "editPermissions") {
                  updateRole({
                    variables: {
                      updatedBy: stateUser!.value!.uid,
                      id: role.id,
                      name: role.name,
                      description:
                        role.description !== null
                          ? role.description
                          : "Please add a description for this role.",
                      orgId: stateUser!.value!.organization?.id,
                      permissions: rolePermissions,
                    },
                    onCompleted: (response) => {
                      const updatedRoles = props.roles.map((ele) => {
                        if (ele.id === role.id) {
                          return {
                            id: role.id,
                            name: role.name,
                            description:
                              role.description !== null
                                ? role.description
                                : "Please add a description for this role.",
                          };
                        } else return ele;
                      });
                      props.setRoles(updatedRoles);
                      onClose();
                      Swal.fire(
                        "Success!",
                        "Role updated successfully.",
                        "success"
                      );
                    },
                  });
                } else {
                  createRole({
                    variables: {
                      createdBy: stateUser!.value!.uid,
                      id: role.id,
                      name: role.name,
                      description: role.description,
                      orgId: stateUser!.value!.organization?.id,
                      permissions: rolePermissions,
                    },
                    onCompleted: (response) => {
                      onClose();
                      const updatedRoleOptions = [
                        ...props.roleOptions,
                        { value: role.id, label: role.name },
                      ];
                      props.setRoleOptions(updatedRoleOptions);
                      props.setRoles([...props.roles, role]);
                      Swal.fire(
                        "Success!",
                        "Role created successfully.",
                        "success"
                      );
                    },
                  });
                }
              }}
            >
              {props.case === "editPermissions" ? "Save" : "Create"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

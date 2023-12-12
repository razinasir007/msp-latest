import React, { useContext, useState } from "react";
import { useMutation } from "@apollo/client";
import { AddIcon, CloseIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Text,
  Card,
  CardHeader,
  CardBody,
  Divider,
  SimpleGrid,
  CardFooter,
  Button,
  Center,
  Flex,
  VStack,
  Tag,
  TagLabel,
  IconButton,
} from "@chakra-ui/react";
import Swal from "sweetalert2";
import { DeleteRole } from "../../../../apollo/permissionsQueries";
import { SelectDropdown } from "../../shared/selectDropdown";
import { RolePermissionsModal } from "./rolePermissionsModal";
import { UserPermissions } from "../../../routes/permissionGuard";

const mainCardStyle = {
  padding: 0,
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export const RolesManagement = (props) => {
  const { userPermissions } = useContext(UserPermissions);
  const [deleteRole, { loading: deleteRoleLoading }] = useMutation(DeleteRole);
  const [deleteRoleId, setDeleteRoleId] = useState("");

  return (
    <Box w='100%' h='100%'>
      <SimpleGrid columns={props.roles.length > 0 ? 3 : 1} spacing='20px'>
        {props.roles.map((role, index) => (
          <Card key={index} variant={"outline"} style={mainCardStyle}>
            <CardHeader>
              <Flex w='100%' justifyContent='space-between' alignItems='center'>
                <Text fontWeight='semibold' fontSize='h6'>
                  {role.name}
                </Text>
                <IconButton
                  aria-label='Delete Role'
                  isDisabled={
                    userPermissions.fullAccess ||
                    userPermissions.delete
                      ? false
                      : true
                  }
                  isLoading={role.id === deleteRoleId && deleteRoleLoading}
                  variant='ghost'
                  icon={<DeleteIcon />}
                  onClick={() => {
                    setDeleteRoleId(role.id);
                    deleteRole({
                      variables: { id: role.id },
                      onCompleted: (resp) => {
                        Swal.fire(
                          "Success!",
                          "Role deleted successfully.",
                          "success"
                        );
                        const updatedRoles = props.roles.filter((ele) => {
                          if (ele.id !== role.id) {
                            return ele;
                          }
                        });
                        const updatedRoleOptions = props.roleOptions.filter(
                          (ele) => {
                            if (ele.value !== role.id) {
                              return ele;
                            }
                          }
                        );
                        props.setRoleOptions(updatedRoleOptions);
                        props.setRoles(updatedRoles);
                      },
                    });
                  }}
                />
              </Flex>
            </CardHeader>
            <Divider opacity={1} />
            <CardBody>
              <Text fontSize='h7' fontWeight='semibold' noOfLines={5}>
                Description:
              </Text>
              <Text fontSize='p7'>{role.description}</Text>
            </CardBody>
            <CardFooter>
              <RolePermissionsModal
                role={role}
                roles={props.roles}
                setRoles={props.setRoles}
                case={"editPermissions"}
                roleOptions={props.roleOptions}
                setRoleOptions={props.setRoleOptions}
              />
            </CardFooter>
          </Card>
        ))}
        {props.roles.length > 0 ? (
          <Card
            variant='outline'
            backgroundColor='#F7F5F0'
            style={mainCardStyle}
          >
            <CardHeader>
              <Text fontWeight='semibold' fontSize='h6'>
                Create New Role
              </Text>
            </CardHeader>
            <CardBody>
              <Center h='100%' w='100%'>
                <RolePermissionsModal
                  case={"createNewRole"}
                  setRoles={props.setRoles}
                  roles={props.roles}
                  roleOptions={props.roleOptions}
                  setRoleOptions={props.setRoleOptions}
                />
              </Center>
            </CardBody>
          </Card>
        ) : (
          <Center h='100%' w='100%'>
            <RolePermissionsModal
              case={"createFirstRole"}
              setRoles={props.setRoles}
              roles={props.roles}
              roleOptions={props.roleOptions}
              setRoleOptions={props.setRoleOptions}
            />
          </Center>
        )}
      </SimpleGrid>
    </Box>
  );
};

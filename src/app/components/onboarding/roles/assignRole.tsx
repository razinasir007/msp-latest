import React, { useState, useEffect } from "react";
import {
  Card,
  Center,
  CardHeader,
  Flex,
  CardBody,
  VStack,
  HStack,
  Box,
  Text,
} from "@chakra-ui/react";
import { SelectDropdown } from "../../shared/selectDropdown";
import { GetRolesByOrgId } from "../../../../apollo/permissionsQueries";
import { useQuery } from "@apollo/client";

const mainCardStyle = {
  padding: "0",
  width: "50%",
  height: "30vh",
  borderRadius: "4px",
  borderColor: "#E2E8F0",
  background: "#FCFCFA",
  marginTop: "30px",
};

export const AssignRole = (props) => {
  const [defaultRoles, setDefaultRoles] = useState<any>([]);

  const { loading: defaultRolesLoading, data: defaultRolesData } = useQuery(
    GetRolesByOrgId,
    {
      variables: { orgId: props.orgId },
    }
  );

  useEffect(() => {
    if (defaultRolesData?.dynamicRolesPermissions?.lookupRolesByOrganization) {
      setDefaultRoles(
        defaultRolesData?.dynamicRolesPermissions?.lookupRolesByOrganization
      );
    }
  }, [defaultRolesData]);

  return (
    <Center>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader pb='8px'>
          <Flex width='100%' justifyContent='center'>
            <Text fontSize='h5' fontWeight='semibold'>
              Assign a role
            </Text>
          </Flex>
        </CardHeader>
        <CardBody pt='8px'>
          <SelectDropdown
            containerHeight='55px'
            labelSize='p5'
            placeholder='Select a role'
            label='Select a role'
            loading={defaultRolesLoading}
            options={defaultRoles.map((ele) => ({
              label: ele.name,
              value: ele.id,
              role: ele,
            }))}
            defaultValue={
              props.role &&
              props.role.id.length && {
                label: props.role.name,
                value: props.role.id,
                role: props.role,
              }
            }
            onChange={(option) => {
              props.setRole({
                id: option.role.id,
                name: option.role.name,
                description: option.role.description,
              });
            }}
          />
        </CardBody>
      </Card>
    </Center>
  );
};

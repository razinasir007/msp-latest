import React, { useContext, useEffect, useState } from "react";

import {
  Box,
  Text,
  Divider,
  VStack,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Button,
  Flex,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useQuery, useMutation } from "@apollo/client";
import { GetUser, UpdateUser } from "../../../../apollo/userQueries";
import { globalState } from "../../../../state/store";

import { LabeledInput } from "../../../components/shared/labeledInput";
import { DeleteModal } from "../../../components/settings/accountManagement/deleteModal";
import { ResetPasswordModal } from "../../../components/settings/accountManagement/resetPasswordModal";
import { AddressInput } from "../../../components/shared/addressInput";
import { UpdateLocation } from "../../../../apollo/helperQueries";
import { UserDetails } from "../../../components/interfaces";
import { useHookstate } from "@hookstate/core";
import { UserPermissions } from "../../../routes/permissionGuard";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export default function AccountManagement() {
  const { userPermissions } = useContext(UserPermissions);
  const [userDetails, setUserDetails] = useState<UserDetails>({
    firstname: "",
    lastname: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: {},
    grantLevel: {},
    location: {},
  });
  const [reset, setReset] = useState<boolean>(false);
  const user = useHookstate(globalState.user);
  const { loading: userLoading, data: userData } = useQuery(GetUser, {
    variables: { id: user!.value?.uid },
  });

  // set local states after data is fetched
  useEffect(() => {
    if (userData) {
      setUserDetails({
        id: userData.users.lookup.id,
        firstname: userData.users.lookup.firstname,
        lastname: userData.users.lookup.lastname,
        email: userData.users.lookup.email,
        phoneNumber: userData.users.lookup.phoneNumber,
        address: userData.users.lookup.address,
        role: {
          id: userData.users.lookup.role.id,
          name: userData.users.lookup.role.name,
        },
        location: {
          id: userData.users.lookup.location?.id,
          label: userData.users.lookup?.address,
          value: {
            description: userData.users.lookup.address,
          },
        },
        parsedLocation: {},
      });
    }
  }, [userData, reset]);

  const [
    updateUser,
    { loading: updateLoading, error: updateError, data: updateData },
  ] = useMutation(UpdateUser, {
    variables: {
      id: user!.value?.uid,
      firstname: userDetails.firstname,
      lastname: userDetails.lastname,
      email: userDetails.email,
      phoneNumber: userDetails.phoneNumber,
      address: userDetails.address,
    },
  });

  const [updateLocation, updateLocationResponse] = useMutation(UpdateLocation, {
    variables: {
      updatedBy: user!.value?.uid,
      location: {
        id: userDetails.location.id,
        name: userDetails.firstname,
        address: userDetails.location.label,
        countryName: userDetails.parsedLocation?.countryName,
        administrativeArea: userDetails.parsedLocation?.administrativeArea,
        administrativeAreaLevel2:
          userDetails.parsedLocation?.administrativeAreaLevel2,
        placeName: userDetails.parsedLocation?.placeName,
        sublocality: userDetails.parsedLocation?.sublocality,
        thoroughfareName: userDetails.parsedLocation?.thoroughfareName,
        thoroughfareNumber: Number(
          userDetails.parsedLocation?.thoroughfareNumber
        ),
        subUnitDesignator: userDetails.parsedLocation?.subUnitDesignator,
        subUnitIdentifier: userDetails.parsedLocation?.subUnitIdentifier,
        postalCode: userDetails.parsedLocation?.postalCode,
      },
    },
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserDetails({
      ...userDetails,
      [event.target.name]: event.target.value,
    });
  };

  function handleLocationChange(location, parsedLocation) {
    userDetails.address = location.label;
    userDetails.parsedLocation = parsedLocation;
    userDetails.location = { ...location, ...userDetails.location };
    setUserDetails({ ...userDetails });
  }

  return (
    <Box height='100%'>
      <Grid
        templateAreas={`"header"
                  "content"
                  "footer"`}
        gridTemplateRows={"75px 1fr 61px"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <Text fontSize='h2' fontWeight='semibold' lineHeight='35px'>
            Account
          </Text>
        </GridItem>

        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <VStack spacing='12px'>
            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Profile
                </Text>
                <Text fontSize='p5' fontWeight='normal' paddingTop='4px'>
                  This information will be displayed publicly so be careful what
                  you share.
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />
              <CardBody padding='8px'>
                <HStack spacing='16px'>
                  <VStack spacing='8px' width='100%'>
                    <LabeledInput
                      label='First Name'
                      placeholder='First Name...'
                      name='firstname'
                      value={userDetails.firstname}
                      loading={userLoading}
                      onChange={handleChange}
                    />
                    <LabeledInput
                      label='Email'
                      placeholder='Email...'
                      name='email'
                      value={userDetails.email}
                      loading={userLoading}
                      isReadOnly
                    />
                    <AddressInput
                      label='Address'
                      placeholder='Address...'
                      name='address'
                      loading={userLoading}
                      value={{
                        label: userDetails.address,
                        value: userDetails.address,
                      }}
                      defaultValue={""}
                      handleLocationChange={handleLocationChange}
                    />
                  </VStack>

                  <VStack spacing='8px' width='100%'>
                    <LabeledInput
                      label='Last Name'
                      placeholder='Last Name...'
                      value={userDetails.lastname}
                      loading={userLoading}
                      name='lastname'
                      onChange={handleChange}
                    />
                    <LabeledInput
                      label='Role'
                      placeholder='Role...'
                      value={userDetails.role?.name}
                      loading={userLoading}
                      isReadOnly
                    />
                    <LabeledInput
                      label='Number'
                      placeholder='Number...'
                      type='number'
                      value={userDetails.phoneNumber}
                      loading={userLoading}
                      name='phoneNumber'
                      onChange={handleChange}
                    />
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Security
                </Text>
                <Text fontSize='p5' fontWeight='normal' paddingTop='4px'>
                  This information is private and for the use of your own
                  account.
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />

              <CardBody padding='8px'>
                <Box width='50%'>
                  <Box width='100%'>
                    <LabeledInput
                      label='Password'
                      placeholder='**********'
                      loading={userLoading}
                      type='password'
                    />
                    <ResetPasswordModal />
                  </Box>
                </Box>
              </CardBody>
            </Card>

            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Delete Account
                </Text>
                <Text fontSize='p5' fontWeight='normal' paddingTop='4px'>
                  This action will delete the user from this account.
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />

              <CardBody padding='8px'>
                <Box width='50%'>
                  <VStack spacing='8px' width='100%'>
                    <Box width='inherit'>
                      <DeleteModal />
                    </Box>
                  </VStack>
                </Box>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        <GridItem padding={"16px 24px"} area={"footer"} bg='greys.200'>
          <Flex justifyContent='end'>
            <Button
              mr={4}
              size='sm'
              variant='outline'
              onClick={() => setReset(!reset)}
              isDisabled={
                userPermissions.fullAccess || userPermissions.edit ? false : true
              }
            >
              Reset
            </Button>
            <Button
              size='sm'
              variant='solid'
              onClick={() => {
                userDetails?.parsedLocation?.countryName
                  ? updateLocation()
                  : "";
                updateUser();
              }}
              isLoading={updateLoading}
              loadingText='Saving...'
              spinnerPlacement='start'
              isDisabled={
                userPermissions.fullAccess || userPermissions.edit ? false : true
              }
            >
              Save
            </Button>
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  );
}

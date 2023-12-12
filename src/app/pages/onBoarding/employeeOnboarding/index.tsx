import React, { useEffect, useState } from "react";
import {
  Button,
  Center,
  VStack,
  Text,
  Flex,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from "@chakra-ui/react";
import { AddressInput } from "../../../components/shared/addressInput";
import { LabeledInput } from "../../../components/shared/labeledInput";
import { EmployeeDetails } from "../../../components/interfaces";
import { useMutation } from "@apollo/client";
import { useFirebaseAuth } from "../../../auth";
import { globalState } from "../../../../state/store";
import { useHookstate } from "@hookstate/core";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { OboardingProfileUpdate } from "../../../../apollo/helperQueries";
import { v4 as uuidv4 } from "uuid";
import { DecryptData, ROUTE_PATHS } from "../../../../constants";

const mainCardStyle = {
  padding: "0",
  width: "50%",
  borderRadius: "4px",
  borderColor: "greys.300",
  marginTop: "15px",
};

export default function EmployeeOnboarding() {
  const { user, signOut } = useFirebaseAuth && useFirebaseAuth();
  const { state } = useLocation();
  const navigate = useNavigate();
  console.log("stateeeeee", state);

  const state_global = useHookstate(globalState);
  const stateUser = state_global.user.get();

  const [employeeInfo, setEmployeeInfo] = useState<EmployeeDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    parsedLocation: {},
  });

  useEffect(() => {
    if (stateUser) {
      setEmployeeInfo({
        ...employeeInfo,
        firstName: stateUser?.displayName?.split[0] || "",
        lastName: stateUser?.displayName?.split[1] || "",
        phoneNumber: stateUser.phoneNumber || "",
        email: stateUser!.email || "",
      });
    }
  }, [user]);

  const [ProfileUpdate, ProfileUpdateResponse] = useMutation(
    OboardingProfileUpdate
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmployeeInfo({
      ...employeeInfo,
      [event.target.name]: event.target.value,
    });
  };

  const handleLocationChange = (location, parsedLocation) => {
    employeeInfo.address = location.label;
    employeeInfo.parsedLocation = parsedLocation;
    setEmployeeInfo({ ...employeeInfo });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const userLocId = uuidv4();

    ProfileUpdate({
      variables: {
        updatedBy: user!.uid,
        createdBy: user!.uid,
        user: {
          id: user!.uid,
          firstname: employeeInfo.firstName,
          lastname: employeeInfo.lastName,
          email: employeeInfo.email,
          address: employeeInfo.address,
          phoneNumber: employeeInfo.phoneNumber,
          storeLocId: state,
          isAdmin: false,
          isOnboarded: true,
        },
        location: {
          id: userLocId,
          name: `${employeeInfo.firstName} Personal Address`,
          address: employeeInfo.address,
          countryName: employeeInfo.parsedLocation?.countryName,
          administrativeArea: employeeInfo.parsedLocation?.administrativeArea,
          administrativeAreaLevel2:
            employeeInfo.parsedLocation?.administrativeAreaLevel2,
          placeName: employeeInfo.parsedLocation?.placeName,
          sublocality: employeeInfo.parsedLocation?.sublocality,
          thoroughfareName: employeeInfo.parsedLocation?.thoroughfareName,
          thoroughfareNumber: Number(
            employeeInfo.parsedLocation?.thoroughfareNumber
          ),
          subUnitDesignator: employeeInfo.parsedLocation?.subUnitDesignator,
          subUnitIdentifier: employeeInfo.parsedLocation?.subUnitIdentifier,
          postalCode: employeeInfo.parsedLocation?.postalCode,
        },
        userLocation: {
          locId: userLocId,
          userId: user!.uid,
        },
      },
      onCompleted: (resp) => {
        if (resp.users.update === true) {
          Swal.fire({
            icon: "success",
            titleText: "Onboarding Successfull!",
            text: "Thank you for signing up!",
            confirmButtonText: "Continue to home...",
          }).then(() => {
            signOut();
            navigate(ROUTE_PATHS.SIGN_IN);
          });
        } else {
          console.log("ERROR UPDATED THE USER");
        }
      },
      onError: (err) => {
        console.log("ERROR UPDATING USER::::::", err);
      },
    });
  };

  return (
    <Center mt='50px' flexDirection={"column"}>
      <Center>
        <Text fontSize='h3' fontWeight='600'>
          Employee Onboarding
        </Text>
      </Center>

      <Card variant='outline' style={mainCardStyle}>
        <CardHeader>
          <Flex width='100%' justify='center'>
            <Text fontSize='18px' fontWeight='600'>
              Employee Information
            </Text>
          </Flex>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardBody>
            <VStack width='100%' spacing='15px'>
              <LabeledInput
                containerHeight='55px'
                name='firstName'
                label='First Name'
                labelSize='p5'
                placeholder='First Name...'
                type='text'
                required
                value={employeeInfo.firstName}
                onChange={handleChange}
              />
              <LabeledInput
                containerHeight='55px'
                name='lastName'
                label='Last Name'
                labelSize='p5'
                placeholder='Last Name...'
                type='text'
                required
                value={employeeInfo.lastName}
                onChange={handleChange}
              />
              <LabeledInput
                containerHeight='55px'
                label='Email'
                name='email'
                required
                labelSize='p5'
                type='email'
                placeholder='Email...'
                value={employeeInfo.email}
                isReadOnly={true}
                // onChange={handleChange}
              />
              <LabeledInput
                containerHeight='55px'
                label='Phone Number'
                name='phoneNumber'
                labelSize='p5'
                required
                placeholder='Phone Number...'
                type='number'
                value={employeeInfo.phoneNumber}
                onChange={handleChange}
              />
              <AddressInput
                label='Address'
                labelSize='p5'
                placeholder='Address...'
                defaultValue=''
                name='address'
                value={{
                  label: employeeInfo.address,
                  value: employeeInfo.address,
                }}
                handleLocationChange={handleLocationChange}
              />
            </VStack>
          </CardBody>
          <CardFooter>
            <Flex width='100%' justify='right' py={2}>
              <Button type='submit' isLoading={ProfileUpdateResponse.loading}>
                Submit
              </Button>
            </Flex>
          </CardFooter>
        </form>
      </Card>
    </Center>
  );
}

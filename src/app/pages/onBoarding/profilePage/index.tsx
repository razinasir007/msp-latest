import React, { useEffect } from "react";
import {
  Center,
  VStack,
  Text,
  Flex,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { AddressInput } from "../../../components/shared/addressInput";
import { LabeledInput } from "../../../components/shared/labeledInput";

const mainCardStyle = {
  padding: "0",
  width: "50%",
  borderRadius: "4px",
  borderColor: "#E2E8F0",
  background: "#FCFCFA",
  marginTop: "30px",
};

export const ProfilePage = (props: { userInfo; setUserInfo }) => {
  const { userInfo, setUserInfo } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({
      ...userInfo,
      [event.target.name]: event.target.value,
    });
  };

  const handleLocationChange = (location, parsedLocation) => {
    const updatedUserInfo = {...userInfo, address: location.label, parsedLocation: parsedLocation}
    setUserInfo(updatedUserInfo);
  };

  return (
    <Center>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader pb='8px'>
          <Flex width='100%' justifyContent='center'>
            <Text fontSize='h5' fontWeight='semibold'>
              Personal Information
            </Text>
          </Flex>
        </CardHeader>
        <CardBody pt='8px'>
          <VStack width='100%' spacing='15px'>
            <LabeledInput
              containerHeight='55px'
              name='firstName'
              label='First Name'
              labelSize='p5'
              placeholder='First Name...'
              type='text'
              required
              value={userInfo.firstName}
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
              value={userInfo.lastName}
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
              value={userInfo.email}
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
              value={userInfo.phoneNumber}
              onChange={handleChange}
            />
            <AddressInput
              label='Address'
              labelSize='p5'
              placeholder='Address...'
              defaultValue={""}
              name='address'
              value={{
                label: userInfo.address,
                value: { description: userInfo.address },
              }}
              // value={userInfo.address}
              handleLocationChange={handleLocationChange}
            />
          </VStack>
        </CardBody>
      </Card>
    </Center>
  );
};

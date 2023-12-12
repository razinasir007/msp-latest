import React from "react";

import {
  Box,
  Heading,
  HStack,
  VStack,
  FormControl,
  Input,
  Checkbox,
} from "@chakra-ui/react";

export function AddressForm(props: {
  shipDetails: {
    fName: string;
    lName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region?: string;
    zipCode: string;
    country: string;
    useDetailsCheck?: boolean;
  };
  setShipDetails;
}) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setShipDetails({
      ...props.shipDetails,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <VStack spacing={2} padding={2}>
      <Box width='100%'>
        <Heading as='h4' size='md' my='10px'>
          Shipping Address (Optional)
        </Heading>
        <HStack>
          <FormControl>
            <Input
              focusBorderColor='gray.500'
              errorBorderColor='crimson'
              required
              placeholder='First Name'
              variant='flushed'
              type='text'
              id='fName'
              name='fName'
              value={props.shipDetails.fName}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <Input
              focusBorderColor='gray.500'
              errorBorderColor='crimson'
              required
              placeholder='Last Name'
              variant='flushed'
              type='text'
              id='lName'
              name='lName'
              value={props.shipDetails.lName}
              onChange={handleChange}
            />
          </FormControl>
        </HStack>

        <FormControl>
          <Input
            focusBorderColor='gray.500'
            errorBorderColor='crimson'
            required
            placeholder='Address Line 1'
            variant='flushed'
            type='text'
            id='addressLine1'
            name='addressLine1'
            value={props.shipDetails.addressLine1}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl>
          <Input
            focusBorderColor='gray.500'
            errorBorderColor='crimson'
            placeholder='Address Line 2'
            variant='flushed'
            type='text'
            id='addressLine2'
            name='addressLine2'
            value={props.shipDetails.addressLine2}
            onChange={handleChange}
          />
        </FormControl>

        <HStack>
          <FormControl>
            <Input
              focusBorderColor='gray.500'
              errorBorderColor='crimson'
              required
              placeholder='City'
              variant='flushed'
              type='text'
              id='city'
              name='city'
              value={props.shipDetails.city}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <Input
              focusBorderColor='gray.500'
              errorBorderColor='crimson'
              placeholder='State/Province/Region'
              variant='flushed'
              type='text'
              id='region'
              name='region'
              value={props.shipDetails.region}
              onChange={handleChange}
            />
          </FormControl>
        </HStack>

        <HStack>
          <FormControl>
            <Input
              focusBorderColor='gray.500'
              errorBorderColor='crimson'
              required
              placeholder='Zip / Postal Code'
              variant='flushed'
              type='text'
              id='zipCode'
              name='zipCode'
              value={props.shipDetails.zipCode}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <Input
              focusBorderColor='gray.500'
              errorBorderColor='crimson'
              required
              placeholder='Country'
              variant='flushed'
              type='text'
              id='country'
              name='country'
              value={props.shipDetails.country}
              onChange={handleChange}
            />
          </FormControl>
        </HStack>
        <Checkbox
          id='useDetailsCheck'
          name='useDetailsCheck'
          height='50px'
          colorScheme={"gray"}
          onChange={handleChange}
          defaultChecked={props.shipDetails.useDetailsCheck}
        >
          Use this address for payment details
        </Checkbox>
      </Box>
    </VStack>
  );
}

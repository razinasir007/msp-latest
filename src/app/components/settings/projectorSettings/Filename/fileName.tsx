import React, { useContext, useState } from "react";
import {
  Box,
  Text,
  Divider,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Radio,
  RadioGroup,
  VStack,
  CardFooter,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
} from "@chakra-ui/react";
import { useGlobalState } from "../../../../../state/store";
import { GrFormUp, GrFormDown } from "react-icons/gr";
import { UserPermissions } from "../../../../routes/permissionGuard";
import Swal from "sweetalert2";
export const FileName = () => {
  const { userPermissions } = useContext(UserPermissions);
  const [value, setValue] = React.useState("1");
  const {
    setInputValueThumbnailLabels,
    getInputValueThumbnailLabels,
    setInputValueImageLabels,
    getInputValueImageLabels,
    setFilenameExtension,
    getFilenameExtension,
  } = useGlobalState();
  const mainCardStyle = {
    padding: "0",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };
  const handleThumbnailLabel = (e) => {
    setInputValueThumbnailLabels(e);
  };
  const handleImageLabel = (e) => {
    setInputValueImageLabels(e);
  };
  const handleCheckboxChange = (e) => {
    setFilenameExtension(e.target.checked);
  };
  return (
    <>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader padding='8px'>
          <Text fontSize='h5' fontWeight='semibold'>
            Filename
          </Text>
        </CardHeader>
        <Divider width='100%' opacity={1} />
        <CardBody>
          <VStack>
            <HStack width='100%' height='35px'>
              <Text fontSize='h7'>Filename Extensions: </Text>
              <Checkbox
                isDisabled={
                  userPermissions.fullAccess || userPermissions.edit
                    ? false
                    : true
                }
                colorScheme='blackAlpha'
                onChange={handleCheckboxChange}
              >
                Hide
              </Checkbox>
            </HStack>
            <HStack width='100%' height='35px'>
              <Text fontSize='h7'>Shorten Long Names From: </Text>
              <RadioGroup
                onChange={(e) => {
                  if (userPermissions.fullAccess || userPermissions.edit) {
                    setValue(e);
                  } else
                    Swal.fire({
                      icon: "error",
                      title: "Not Allowed",
                      text: "You are not allowed to make changes to this page",
                    });
                }}
                value={value}
              >
                <Radio value='1' colorScheme='blackAlpha'>
                  Left Side
                </Radio>
                <Radio value='2' ml='10px' colorScheme='blackAlpha'>
                  Right Side
                </Radio>
              </RadioGroup>
            </HStack>
            <HStack width='100%' height='35px'>
              <Text fontSize='h7'>Thumbnail Labels Font Size: </Text>
              <Box width='93px'>
                <NumberInput
                  ml='13px'
                  size='sm'
                  defaultValue={12}
                  max={30}
                  onChange={handleThumbnailLabel}
                  isDisabled={
                    userPermissions.fullAccess || userPermissions.edit
                      ? false
                      : true
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper children={<GrFormUp />} />
                    <NumberDecrementStepper children={<GrFormDown />} />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Text fontSize={`${getInputValueThumbnailLabels()}px`}>
                Sample001{" "}
              </Text>
            </HStack>
            <HStack width='100%' height='35px'>
              <Text fontSize='h7'>Large Image Labels Font Size: </Text>
              <Box width='80px'>
                <NumberInput
                  isDisabled={
                    userPermissions.fullAccess || userPermissions.edit
                      ? false
                      : true
                  }
                  size='sm'
                  defaultValue={14}
                  max={30}
                  onChange={handleImageLabel}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper children={<GrFormUp />} />
                    <NumberDecrementStepper children={<GrFormDown />} />
                  </NumberInputStepper>
                </NumberInput>
              </Box>
              <Text fontSize={`${getInputValueImageLabels()}px`}>
                Sample001{" "}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
        <CardFooter>
          <Text fontSize='h7'>
            When using more than one screen,drag this window to the screen that
            your clients will be watching before measuring
          </Text>
        </CardFooter>
      </Card>
    </>
  );
};

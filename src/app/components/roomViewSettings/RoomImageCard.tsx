import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  VStack,
  Text,
  Image,
  Flex,
} from "@chakra-ui/react";
import React from "react";
import { RoomCalibrationModal } from "./RoomCalibrationModal";

export const RoomViewImagesCard = (props: {
  image;
  calibratedValue;
  handleDelete();
  selectedRoom;
  handleCalibrate();
  deleteRoomLoading;
}) => {
  const {
    image,
    calibratedValue,
    handleDelete,
    handleCalibrate,
    selectedRoom,
    deleteRoomLoading,
  } = props;
  return (
    <Card variant='outline' width='100%' maxW='400px'>
      <CardBody>
        <VStack>
          <Box w='100%'>
            <Image src={image} height='250px' />
            <Flex alignItems='center' justifyContent='center' mt='10px'>
              <Text fontSize='p5' fontWeight='semibold'>
                Calibration Value:
              </Text>
              <Text fontSize='p5' ml='7px'>
                {calibratedValue === null
                  ? "None"
                  : `${Number(calibratedValue).toFixed(2)} px`}
              </Text>
            </Flex>

            <HStack mt='10px'>
              <RoomCalibrationModal
                handleCalibrate={handleCalibrate}
                selectedRoom={selectedRoom}
              />
              <Button
                w='100%'
                size='sm'
                variant='outline'
                onClick={handleDelete}
                isLoading={deleteRoomLoading}
              >
                Delete
              </Button>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

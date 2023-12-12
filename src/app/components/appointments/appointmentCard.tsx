import React from "react";
import {
  CardBody,
  VStack,
  Box,
  Card,
  Text,
  Button,
  HStack,
  Flex,
} from "@chakra-ui/react";
import { ViewDetailsModal } from "./viewDetailsModal";

export const AppointmentCard = (props: {
  title;
  numberOfAttributes;
  numberOfUrls;
  configuredEvent;
  handleClick();
}) => {
  const {
    title,
    numberOfAttributes,
    numberOfUrls,
    configuredEvent,
    handleClick,
  } = props;
  return (
    <Card variant='outline' width='100%' maxW='400px'>
      <CardBody>
        <VStack>
          <Box w='100%'>
            <VStack>
              <Text fontSize='14px' fontWeight='600'>
                {title}
              </Text>
            </VStack>
            <Flex mt='20px' justifyContent='space-between' alignItems='center'>
              <VStack>
                <Text fontSize='p6' w='100%' fontWeight='semibold'>
                  Number of attributes
                </Text>
                <Text fontSize='p6' w='100%'>
                  {numberOfAttributes ? numberOfAttributes.length : "None"}
                </Text>
              </VStack>

              <VStack>
                <Text fontSize='p6' w='100%' fontWeight='semibold'>
                  Number of URLS
                </Text>
                <Text fontSize='p6' w='100%'>
                  {numberOfUrls ? numberOfUrls.length : "None"}
                </Text>
              </VStack>
            </Flex>

            <ViewDetailsModal
              handleClick={handleClick}
              configuredEvent={configuredEvent}
            />
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

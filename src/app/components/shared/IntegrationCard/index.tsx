import React from "react";
import {
  Card,
  CardBody,
  VStack,
  Text,
  Box,
  Button,
  Image,
} from "@chakra-ui/react";

export const IntegrationCard = (props) => {
  return (
    <Card variant='outline' width='50%'>
      <CardBody>
        <VStack alignItems='flex-start'>
          <Box width='50%' height='40px'>
            <Image src={props.img} height='80%' objectFit='contain' />
          </Box>
          <Text fontSize='p4' fontWeight='semibold'>
            {props.name}
          </Text>
          <Button
            size='sm'
            rightIcon={props.rightIcon}
            isLoading={props.isLoading}
            onClick={props.handleConnectClick}
            w='100%'
          >
            <Text color={props.textColor}>{props.title}</Text>
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

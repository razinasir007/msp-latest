import React from "react";
import {
  VStack,
  Text,
  HStack,
  Button,
  Card,
  CardBody,
  Flex,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

const BillingPlanCard = (props: {
  activePlan?: boolean;
  id: string;
  title: string;
  description: string;
  amount: string;
  benefits: [];
  duration: string;
  handleClick;
  loading: boolean;
  loadFor: string;
  stripeId?: string;
}) => {
  return (
    <Card
      variant='outline'
      width='100%'
      id={props.id}
      backgroundColor={props.activePlan ? "greys.600" : "greys.400"}
    >
      <CardBody>
        <VStack spacing='10px'>
          <Text fontSize='p5' fontWeight='400'>
            {props.description}
          </Text>
          <Flex align='center'>
            <Text fontSize='36px' fontWeight='500'>
              {props.amount}
            </Text>
            <Text fontSize='24px'>
              {props.amount !== "$0" ? props.duration : ""}
            </Text>
          </Flex>
          <Button
            w='100%'
            onClick={() => props.handleClick(props.id)}
            isLoading={props.loading && props.loadFor === props.id}
            isDisabled={props.stripeId === props.id ? true : false}
          >
            {props.title}
          </Button>
          <VStack width='100%'>
            {props.benefits?.map((benefit, index) => (
              <HStack width='100%' key={index}>
                <CheckCircleIcon boxSize='15px' />
                <Text fontSize='p5'>{benefit}</Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default BillingPlanCard;

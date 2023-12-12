import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react";
import { IntegrationCard } from "../shared/IntegrationCard";
import { paymentSelectionArray } from "../../../constants";
const mainCardStyle = {
  padding: "0",
  width: "50%",
  borderRadius: "4px",
  borderColor: "#E2E8F0",
  background: "#FCFCFA",
  marginTop: "30px",
};
export default function PaymentSelection(props: {
  selectedMethod;
  setSelectedMethod;
  paymentType;
}) {
  const { selectedMethod, setSelectedMethod, paymentType } = props;
  const handleSelectClick = (payment) => {
    if (selectedMethod === payment.name) {
      // If the clicked appointment is already selected, unselect it
      setSelectedMethod("");
    } else {
      // Otherwise, select the clicked appointment
      setSelectedMethod(payment.name);
    }
  };
  console.log("payment type", paymentType);
  return (
    <Center>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader pb='8px'>
          <Flex width='100%' justifyContent='center'>
            <Text fontSize='h5' fontWeight='semibold'>
              Payment Selection
            </Text>
          </Flex>
        </CardHeader>
        <CardBody pt='8px'>
          <VStack spacing='16px'>
            <Text fontSize='p5' fontWeight='400'>
              Please Select a payment method
            </Text>
            <HStack width='100%'>
              {paymentSelectionArray.map((ele) => {
                if (
                  (ele.name === "PayPal" || ele.name === "Square") &&
                  paymentType !== "full"
                ) {
                  return null; // Skip rendering PayPal and Square if paymentType is not "full"
                }
                return (
                  <IntegrationCard
                    name={ele.name}
                    img={ele.image}
                    title={selectedMethod === ele.name ? "Selected" : "Select"}
                    handleConnectClick={() => handleSelectClick(ele)}
                  />
                );
              })}
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Center>
  );
}

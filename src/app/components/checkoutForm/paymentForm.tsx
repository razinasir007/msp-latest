import React from "react";
import { Box, Flex, Heading, VStack, Text } from "@chakra-ui/react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./checkoutForm";
import { useGlobalState } from "../../../state/store";
import { SquarePaymentForm } from "../squarePayment/squarePaymentForm";

const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#121212",
    colorBackground: "#F7F5F0",
    fontFamily: "Poppins, sans-serif",
    borderRadius: "4px",
  },
};

export function PaymentForm(props: {
  clientSecret;
  paymentKey;
  paymentSetupMessage;
  setPaymentSetupMessage;
  paymentIntent;
  setPaymentIntent;
  selectedMethod;
  amount;
  clientId;
  orderId;
}) {
  const {
    clientSecret,
    paymentKey,
    paymentSetupMessage,
    setPaymentSetupMessage,
    paymentIntent,
    setPaymentIntent,
    selectedMethod,
    clientId,
    orderId,
    amount,
  } = props;
  const wrappedState = useGlobalState();
  const stripePromise = loadStripe(paymentKey);
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <VStack spacing={2} padding={2}>
      <Box width='100%'>
        <Heading as='h4' size='md' my='10px'>
          Payment Method
        </Heading>
        <Flex justifyContent={"center"}>
          <Box width={"50%"} padding={"16px"}>
            {wrappedState.getPaymentCheck() ? (
              <Text fontSize={"h5"}>
                Payment was successfully made, proceed to the next step.
              </Text>
            ) : selectedMethod === "Stripe" ? (
              clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    setPaymentSetupMessage={setPaymentSetupMessage}
                    setPaymentIntent={setPaymentIntent}
                  />
                </Elements>
              )
            ) : selectedMethod === "PayPal" ? (
              <Text> Paypal</Text>
            ) : (
              <SquarePaymentForm
                amount={amount}
                clientId={clientId}
                orderId={orderId}
              />
            )}
          </Box>
        </Flex>
      </Box>
    </VStack>
  );
}

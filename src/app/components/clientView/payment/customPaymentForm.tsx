import { Button, Text } from "@chakra-ui/react";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useGlobalState } from "../../../../state/store";

const paymentElementOptions = {
  layout: "tabs",
};
export const CustomPaymentForm = (props: {
  clientSecret;
  setPaymentIntentMessage;
  setPaymentIntent;
}) => {
  const { clientSecret, setPaymentIntentMessage, setPaymentIntent } = props;
  const state = useGlobalState();
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getPaymentStatus = async () => {
      if (!stripe || !clientSecret) {
        return;
      }
      try {
        const { paymentIntent } = await stripe.retrievePaymentIntent(
          clientSecret
        );
        if (paymentIntent) {
          switch (paymentIntent.status) {
            case "succeeded":
              setMessage("Payment made successfully!");
              setPaymentIntentMessage(paymentIntent.status);
              break;

            case "processing":
              setMessage("Your payment is processing.");
              setPaymentIntentMessage(paymentIntent.status);
              break;

            case "requires_payment_method":
              setMessage(
                "Please select a payment method and fill in the details to continue."
              );
              setPaymentIntentMessage(paymentIntent.status);
              break;

            default:
              setMessage("Something went wrong.");
              setPaymentIntentMessage(paymentIntent.status);
              break;
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    getPaymentStatus();
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`. For some payment methods like iDEAL, your customer will
      // be redirected to an intermediate site first to authorize the payment, then
      // redirected to the `return_url`.
      if (error) {
        const { message, type } = error;
        message && setMessage(message);
        // Swal.fire("Error processing payment", message, "error");

        console.log(type, message); // log the error type for debugging
      } else {
        setIsLoading(false);
        setMessage("Payment succeeded!");
        state.setCustomPaymentCheck(true);
        setPaymentIntent("succeeded");
        // Swal.fire("Success!", "Payment succeeded!", "success");
      }
    } catch (error) {
      console.log(error);
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };
  return (
    <form id='payment-form' onSubmit={handleSubmit}>
      <PaymentElement id='payment-element' options={paymentElementOptions} />
      <Button
        mt='10px'
        disabled={isLoading || !stripe || !elements}
        type='submit'
        isLoading={isLoading}
        width='100%'
      >
        Pay now
      </Button>

      {/* Show any error or success messages */}
      {message !== "" && (
        <Text
          id='payment-message'
          color='rgb(105, 115, 134)'
          fontSize='16px'
          lineHeight='20px'
          paddingTop=' 12px'
          textAlign='center'
        >
          {message}
        </Text>
      )}
    </form>
  );
};

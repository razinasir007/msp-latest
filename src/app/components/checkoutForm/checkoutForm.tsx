import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button, Text } from "@chakra-ui/react";
import Swal from "sweetalert2";
import { useGlobalState } from "../../../state/store";
import { Intents } from "../../../constants";

const paymentElementOptions = {
  layout: "tabs",
};

export default function CheckoutForm(props: {
  clientSecret;
  setPaymentSetupMessage;
  setPaymentIntent;
}) {
  const { clientSecret, setPaymentSetupMessage, setPaymentIntent } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const wrappedState = useGlobalState();
  useEffect(() => {
    const getPaymentStatus = async () => {
      if (!stripe || !clientSecret) {
        return;
      }
      try {
        const intentType = clientSecret.split("_")[0];
        switch (intentType) {
          case Intents.setupIntent:
            const { setupIntent } = await stripe.retrieveSetupIntent(
              clientSecret
            );
            if (setupIntent) {
              switch (setupIntent.status) {
                case "succeeded":
                  setMessage("Payment made successfully!");
                  setPaymentSetupMessage(setupIntent.status);
                  break;

                case "processing":
                  setMessage("Your payment is processing.");
                  setPaymentSetupMessage(setupIntent.status);
                  break;

                case "requires_payment_method":
                  setMessage(
                    "Please select a payment method and fill in the details to continue."
                  );
                  setPaymentSetupMessage(setupIntent.status);
                  break;

                default:
                  setMessage("Something went wrong.");
                  setPaymentSetupMessage(setupIntent.status);
                  break;
              }
            }
            break;
          case Intents.paymentIntent:
            const { paymentIntent } = await stripe.retrievePaymentIntent(
              clientSecret
            );
            if (paymentIntent) {
              switch (paymentIntent.status) {
                case "succeeded":
                  setMessage("Subscribed successfully!");
                  break;
                case "processing":
                  setMessage("Your payment is processing.");
                  break;
                case "requires_payment_method":
                  setMessage(
                    "Please select a payment method and fill in the details to continue."
                  );
                  break;
                default:
                  setMessage("Something went wrong.");
                  break;
              }
            }
            break;
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
      const intentType = clientSecret.split("_")[0];
      switch (intentType) {
        case Intents.setupIntent:
          const { error } = await stripe.confirmSetup({
            elements,
            redirect: "if_required",
          });

          if (error) {
            const { message, type } = error;
            message && setMessage(message);
            Swal.fire("Error processing payment", message, "error"); // log the error type for debugging
            console.log(type, message); // log the error type for debugging
          }

          // Setup succeeded
          else {
            //set flag for payment true
            wrappedState.setPaymentCheck(true);
            setIsLoading(false);

            setMessage("Payment succeeded!");
            setPaymentSetupMessage("succeeded");
            Swal.fire("Success!", "Payment succeeded!", "success");
          }
          break;

        case Intents.paymentIntent:
          const response = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
          });

          // This point will only be reached if there is an immediate error when
          // confirming the payment. For some payment methods like iDEAL, your customer will
          // be redirected to an intermediate site first to authorize the payment, then
          // redirected to the `return_url`.
          if (response.error) {
            const { message, type } = response.error;
            message && setMessage(message);

            console.log(type); // log the error type for debugging
          }

          // Payment succeeded
          if (response.paymentIntent) {
            const { paymentIntent } = response;
            //set flag for payment true
            wrappedState.setPaymentCheck(true);
            setPaymentIntent("succeeded"); // Set paymentIntent to "succeeded"
            setIsLoading(false);
            setMessage("Payment succeeded!");
            // Use the paymentIntent object for further processing
            // setFinalPaymentIntent(paymentIntent);
            Swal.fire("Success!", "Payment succeeded!", "success");
          }
          break;
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
}

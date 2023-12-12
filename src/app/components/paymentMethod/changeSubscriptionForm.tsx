import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Text, Button } from "@chakra-ui/react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { Intents, ROUTE_PATHS } from "../../../constants";

const paymentElementOptions = {
  layout: "tabs",
};

export default function ChangeSubscriptionForm(props: {
  clientSecret;
  setFinalPaymentIntent;
  onCloseModal();
}) {
  const navigate = useNavigate();
  const { clientSecret, setFinalPaymentIntent } = props;
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getPaymentStatus = async () => {
    if (!stripe || !clientSecret) {
      return;
    }
    try {
      const intentType = clientSecret.split("_")[0];
      switch (intentType) {
        case Intents.setupIntent:
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
  useEffect(() => {
    getPaymentStatus();
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stripe.js hasn't yet loaded.
    // Make sure to disable form submission until Stripe.js has loaded.
    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      submitError.message && setMessage(submitError.message);
      return;
    }

    // Since the redirect is only if required, we get an error in the console about CSP
    // The link below explains this issue and why not to worry about it
    // https://github.com/stripe/stripe-js/issues/127
    try {
      const intentType = clientSecret.split("_")[0];
      switch (intentType) {
        case Intents.setupIntent:
          const result = await stripe.confirmSetup({
            elements,
            clientSecret,
            redirect: "if_required",
          });

          if (result.error) {
            const { message, type } = result.error;
            message && setMessage(message);
            console.log(type); // log the error type for debugging
          }

          // Setup succeeded
          if (result.setupIntent) {
            const { setupIntent } = result;
            // Set the status
            setFinalPaymentIntent(setupIntent);
            props.onCloseModal();
            Swal.fire({
              title: "Success!",
              text: "Payment succeeded!",
              icon: "success",
              confirmButtonText: "Go to home page",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate(ROUTE_PATHS.HOME);
              }
            });
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
            // Use the paymentIntent object for further processing
            setFinalPaymentIntent(paymentIntent);
            props.onCloseModal();
            Swal.fire({
              title: "Success!",
              text: "Payment succeeded!",
              icon: "success",
              confirmButtonText: "Go to home page",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate(ROUTE_PATHS.HOME);
              }
            });
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
        {clientSecret.split("_")[0] === Intents.paymentIntent
          ? "Pay now"
          : "Save payment details for later"}
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

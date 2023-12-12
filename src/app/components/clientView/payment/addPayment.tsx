import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Flex,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { LabeledInput } from "../../shared/labeledInput";
import { SelectDropdown } from "../../shared/selectDropdown";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { PaymentDetails } from "../../interfaces";
import { CreateClientCustomPayment } from "../../../../apollo/paymentQueries";
import { useMutation } from "@apollo/client";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { CustomPaymentForm } from "./customPaymentForm";
import Swal from "sweetalert2";
import { UserPermissions } from "../../../routes/permissionGuard";
const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#121212",
    colorBackground: "#F7F5F0",
    fontFamily: "Poppins, sans-serif",
    borderRadius: "4px",
  },
};
export const AddPayment = (props) => {
  const { userPermissions } = useContext(UserPermissions);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const stateUser = useHookstate(globalState.user);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentKey, setPaymentKey] = useState("");
  const [paymentIntentMessage, setPaymentIntentMessage] = useState("");
  const [paymentIntent, setPaymentIntent] = useState("");
  const [stripePromise, setStripePromise] = useState(null); // Declare stripePromise at a higher scope
  const [paymentType, setPaymentType] = useState({
    name: "",
    value: "",
  });
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    item: "",
    paymentDate: "",
    amountPaid: "",
    amountRemaining: "",
  });
  // const stripePromise = loadStripe(paymentKey);
  const options = {
    clientSecret,
    appearance,
  };

  const [
    GetCustomPaymentClientSecret,
    {
      loading: GetCustomPaymentClientSecretLoading,
      error: GetCustomPaymentClientSecretError,
      data: GetCustomPaymentClientSecretData,
    },
  ] = useMutation(CreateClientCustomPayment, {});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentDetails({
      ...paymentDetails,
      [event.target.name]: event.target.value,
    });
  };

  const type = [
    {
      name: "Cash",
      value: "CASH",
    },
    {
      name: "Existing Method",
      value: "EXISTING_METHOD",
    },
    {
      name: "New Method",
      value: "NEW_METHOD",
    },
  ];
  const handleSubmit = () => {
    GetCustomPaymentClientSecret({
      variables: {
        createdBy: stateUser!.value!.uid,
        customPayment: {
          amount: paymentDetails.amountPaid,
          currency: "USD",
          clientId: props.clientId,
          orderId: props.orderId,
          medium: paymentType,
        },
      },
      onCompleted: (response) => {
        if (response) {
          if (
            response.payments &&
            response.payments.createClientCustomPayment &&
            response.payments.createClientCustomPayment.paymentIntentKeys !==
              null
          ) {
            setClientSecret(
              response.payments.createClientCustomPayment.paymentIntentKeys
                .clientSecret
            );
            setPaymentKey(
              response.payments.createClientCustomPayment.paymentIntentKeys
                .paymentKey
            );
            setShowStripeForm(true);
          } else {
            onClose();
            Swal.fire({
              icon: "error",
              titleText: "Payment intent failed",
              text: "Error while generating payment key",
            });
          }
        }
      },
    });
  };
  useEffect(() => {
    if (paymentKey) {
      setStripePromise(loadStripe(paymentKey));
      // Now you can use stripePromise in your Elements component
    }
  }, [paymentKey]);

  return (
    <>
      <Button
        isDisabled={
          userPermissions.fullAccess || userPermissions.create || userPermissions.edit ? false : true
        }
        size='sm'
        leftIcon={<AddIcon />}
        onClick={onOpen}
      >
        Add Payment
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} size='lg'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Custom Payment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Conditionally render the Stripe payment form only if clientSecret and paymentKey are present */}
            {showStripeForm && clientSecret && paymentKey ? (
              <Elements options={options} stripe={stripePromise}>
                <CustomPaymentForm
                  clientSecret={clientSecret}
                  setPaymentIntent={setPaymentIntent}
                  setPaymentIntentMessage={setPaymentIntentMessage}
                />
              </Elements>
            ) : (
              <VStack spacing='8px' width='100%' alignItems='flex-start'>
                <LabeledInput
                  containerHeight='55px'
                  label='Amount Paid'
                  placeholder='Amount Paid...'
                  labelSize='p5'
                  type='number'
                  required={true}
                  onChange={handleChange}
                  name='amountPaid'
                />
                <SelectDropdown
                  containerHeight='55px'
                  labelSize='p5'
                  placeholder='Type'
                  label='Type'
                  options={type.map((ele) => ({
                    label: ele.name,
                    value: ele.value,
                  }))}
                  onChange={(option) => {
                    setPaymentType(option.value);
                  }}
                />
              </VStack>
            )}
          </ModalBody>

          <ModalFooter
            borderTopWidth='1px'
            padding='16px 24px'
            borderColor='greys.300'
          >
            {!showStripeForm && (
              <Flex justifyContent='end'>
                <Button mr={4} size='sm' variant='outline'>
                  Clear
                </Button>
                <Button
                  size='sm'
                  variant='solid'
                  isLoading={GetCustomPaymentClientSecretLoading}
                  onClick={handleSubmit}
                  loadingText='Saving...'
                  spinnerPlacement='start'
                >
                  Save
                </Button>
              </Flex>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

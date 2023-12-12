import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Text,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { useContext, useState } from "react";
import { ChangePaymentMethodForm } from "./changePaymentMethodForm";
import { appConfig } from "../../../config";
import { UserPermissions } from "../../routes/permissionGuard";

const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#121212",
    colorBackground: "#F7F5F0",
    fontFamily: "Poppins, sans-serif",
    borderRadius: "4px",
  },
};
export const ChangePaymentMethodModal = (props: {
  loading;
  handleMethodChange();
  clientSecret;
  paymentKeyClient?;
}) => {
  const { clientSecret } = props;
  const paymentKey: string = appConfig.REACT_APP_STRIPE_PAYMENT_KEY || "";
  const stripePromise = loadStripe(
    props.paymentKeyClient !== undefined ? props.paymentKeyClient : paymentKey
  );
  const { userPermissions } = useContext(UserPermissions);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [setupIntentMessage, setSetupIntentMessage] = useState("");
  const [setupIntent, setSetupIntent] = useState("");
  const options = {
    clientSecret,
    appearance,
  };
  return (
    <>
      <Button
        size='sm'
        isDisabled={
          userPermissions.fullAccess || userPermissions.edit
            ? false
            : true
        }
        // mt='20px'
        onClick={() => {
          props.handleMethodChange(), onOpen();
        }}
        isLoading={props.loading}
      >
        Change Payment Method
      </Button>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size='lg'
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Payment Method</ModalHeader>
          <ModalCloseButton />
          {props.loading ? (
            <Center>
              <Spinner />
            </Center>
          ) : (
            <ModalBody>
              {props.clientSecret && (
                <Elements options={options} stripe={stripePromise}>
                  <ChangePaymentMethodForm
                    clientSecret={props.clientSecret}
                    setSetupIntent={setSetupIntent}
                    setSetupIntentMessage={setSetupIntentMessage}
                  />
                </Elements>
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

import React, { useState } from "react";
import {
  Text,
  Box,
  Center,
  VStack,
  HStack,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Spinner,
  ModalBody,
  useDisclosure,
} from "@chakra-ui/react";
import BillingPlanCard from "../../components/onboarding/billing/BillingPlanCard";
import { SubscriptionPlans } from "../../components/interfaces";
import { useMutation, useQuery } from "@apollo/client";
import { GetSubscriptionPlans } from "../../../apollo/subscriptionPlan";
import { CreateUserPaymentSubscription } from "../../../apollo/paymentQueries";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation } from "react-router-dom";
import ChangeSubscriptionForm from "../../components/paymentMethod/changeSubscriptionForm";
import { appConfig } from "../../../config";
import { appearance } from "../../../constants";

export const PaymentPlans = () => {
  const { state } = useLocation();
  const paymentKey: string = appConfig.REACT_APP_STRIPE_PAYMENT_KEY || "";
  const stripePromise = loadStripe(paymentKey);
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlans[]
  >([
    {
      id: "",
      title: "",
      description: "",
      amount: 0,
      benefits: [],
      currency: "",
      intervalCount: 0,
      intervalUnit: "",
      cycleAmount: "0.00",
    },
  ]);
  const [clientSecret, setClientSecret] = useState("");
  const [finalPaymentIntent, setFinalPaymentIntent] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loadPlan, setLoadPlan] = useState("");

  const [
    CreatePaymentSubscription,
    {
      loading: createSubscriptionLoading,
      error: createSubscriptionError,
      data: createSubscriptionData,
    },
  ] = useMutation(CreateUserPaymentSubscription);
  //Get subscription plans details from BE
  useQuery(GetSubscriptionPlans, {
    onCompleted: (response) => {
      setSubscriptionPlans(response.payments.getSubscriptionPlans);
    },
    onError: (error) => {
      console.log("ERROR FETCHING SUBSCRIPTION PLANS", error);
    },
  });
  const handleBillingPlanCardClick = (planID) => {
    setLoadPlan(planID);
    onOpen();
    CreatePaymentSubscription({
      variables: {
        userId: state.userId,
        stripePriceId: planID,
      },
      onCompleted: (resp) => {
        setClientSecret(resp.payments.createUserPaymentSubscription);
      },
    });
  };
  const options = {
    clientSecret,
    appearance,
  };
  return (
    <>
      <Box height='100%'>
        <Grid
          templateAreas={`"header"
                "content" 
                "footer"`}
          gridTemplateRows={"100px 1fr 61px"}
          gridTemplateColumns={"1fr"}
          h='100%'
        >
          <GridItem padding={"24px 24px 16px"} area={"header"}>
            <HStack justifyContent='space-between'>
              <Text fontSize='h2' fontWeight='semibold' lineHeight='35px'>
                Payment Plans
              </Text>
            </HStack>
          </GridItem>
          <GridItem px='24px' paddingBottom='16px' area={"content"}>
            <VStack>
              <HStack w='100%'>
                {/* UPDATE THIS BELOW TO SHOW ACTIVE PLAN WITH A DIFFERENT COLOR SO IT IS EASILY DISTINGUISHABLE. */}

                {subscriptionPlans.map((plan, index) => (
                  <BillingPlanCard
                    key={index}
                    id={plan.id}
                    title={plan.title}
                    description={plan.description}
                    amount={`$${Number(plan.cycleAmount) / plan.intervalCount}`}
                    duration={`/${plan.intervalUnit}`}
                    benefits={plan.benefits}
                    handleClick={handleBillingPlanCardClick}
                  />
                ))}
              </HStack>
            </VStack>
          </GridItem>
        </Grid>
        <Modal
          blockScrollOnMount={false}
          isOpen={isOpen}
          onClose={onClose}
          size='lg'
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Change subscription plan</ModalHeader>
            <ModalCloseButton />
            {createSubscriptionLoading ? (
              <Center>
                <Spinner />
              </Center>
            ) : (
              <ModalBody>
                {clientSecret && (
                  <Elements options={options} stripe={stripePromise}>
                    <ChangeSubscriptionForm
                      clientSecret={clientSecret}
                      onCloseModal={() => onClose()}
                      setFinalPaymentIntent={setFinalPaymentIntent}
                    />
                  </Elements>
                )}
              </ModalBody>
            )}
          </ModalContent>
        </Modal>
      </Box>
    </>
  );
};

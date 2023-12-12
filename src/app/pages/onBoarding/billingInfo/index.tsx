import React, { useState } from "react";
import {
  Text,
  Card,
  Center,
  CardBody,
  VStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  CardHeader,
  Flex,
} from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import BillingCheckoutForm from "../../../components/onboarding/billing/BillingCheckoutForm";
import BillingPlanCard from "../../../components/onboarding/billing/BillingPlanCard";
import { GoDotFill } from "react-icons/go";
import { CreateUserPaymentSubscription } from "../../../../apollo/paymentQueries";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useHookstate } from "@hookstate/core";
import { globalState, useGlobalState } from "../../../../state/store";
import { appConfig } from "../../../../config";

const mainCardStyle = {
  padding: "0",
  width: "50%",
  borderRadius: "4px",
  borderColor: "#E2E8F0",
  background: "#FCFCFA",
  marginTop: "30px",
};

const appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#121212",
    colorBackground: "#F7F5F0",
    fontFamily: "Poppins, sans-serif",
    borderRadius: "4px",
  },
};

const paymentKey: string = appConfig.REACT_APP_STRIPE_PAYMENT_KEY || "";
const stripePromise = loadStripe(paymentKey);

export const BillingInfo = (props: {
  subscriptionPlans;
  userId;
  finalPaymentIntent;
  setFinalPaymentIntent;
}) => {
  const {
    subscriptionPlans,
    userId,
    finalPaymentIntent,
    setFinalPaymentIntent,
  } = props;

  const state = useHookstate(globalState);
  const stateUser = state.user.get();
  const wrappedState = useGlobalState();
  const [loadPlan, setLoadPlan] = useState("");
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [clientSecret, setClientSecret] = useState("");

  const [CreatePaymentSubscription, CreatePaymentSubscriptionResp] =
    useMutation(CreateUserPaymentSubscription);

  const handleBillingPlanCardClick = (planID) => {
    setLoadPlan(planID);
    CreatePaymentSubscription({
      variables: {
        userId: userId,
        stripePriceId: planID,
      },
      onCompleted: (resp) => {
        setClientSecret(resp.payments.createUserPaymentSubscription);
        setSelectedTabIndex(1);
        wrappedState.setStripePirceIdForUser(planID);
      },
    });
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Center>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader pb='8px'>
          <Flex width='100%' justifyContent='center'>
            <Text fontSize='h5' fontWeight='semibold'>
              Organization Billing
            </Text>
          </Flex>
        </CardHeader>
        <CardBody pt='8px'>
          <Tabs
            variant='soft-rounded'
            index={selectedTabIndex}
            alignItems='center'
          >
            {/* VALIDTAION NEEDS TO BE UPDATED TO CHECK IF THE SUBSCRIPTION
            HAS STARTED AND AN AMOUNT IS DEDUCTED ALREADY. */}
            <VStack>
              {finalPaymentIntent &&
              finalPaymentIntent.status === "succeeded" ? (
                //   ||
                // stateUser?.organization?.subscription
                <Text fontSize={"h5"}>
                  {finalPaymentIntent.object === "setup_intent"
                    ? "Card details saves successfully, proceed to the next step."
                    : "Payment was successfully made, proceed to the next step."}
                </Text>
              ) : (
                <>
                  <TabList>
                    <Tab
                      _selected={{ color: "black" }}
                      color='#BFBFBF'
                      isDisabled={selectedTabIndex === 1}
                    >
                      <GoDotFill size={20} />
                    </Tab>
                    <Tab
                      _selected={{ color: "black" }}
                      color='#BFBFBF'
                      marginLeft='-20px'
                      isDisabled={selectedTabIndex === 0}
                    >
                      <GoDotFill size={20} />
                    </Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <HStack>
                        {subscriptionPlans.map((plan, index) => (
                          <BillingPlanCard
                            key={index}
                            id={plan.id}
                            title={plan.title}
                            description={plan.description}
                            amount={`$${
                              Number(plan.cycleAmount) / plan.intervalCount
                            }`}
                            duration={`/${plan.intervalUnit}`}
                            benefits={plan.benefits}
                            handleClick={handleBillingPlanCardClick}
                            loading={CreatePaymentSubscriptionResp.loading}
                            loadFor={loadPlan}
                          />
                        ))}
                      </HStack>
                    </TabPanel>
                    {clientSecret && (
                      <TabPanel>
                        <Elements options={options} stripe={stripePromise}>
                          <BillingCheckoutForm
                            clientSecret={clientSecret}
                            setFinalPaymentIntent={setFinalPaymentIntent}
                          />
                        </Elements>{" "}
                      </TabPanel>
                    )}
                  </TabPanels>
                </>
              )}
            </VStack>
          </Tabs>
        </CardBody>
      </Card>
    </Center>
  );
};

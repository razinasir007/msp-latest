import React, { useContext, useEffect, useState } from "react";
import { Box, Grid, GridItem, HStack, VStack, Text } from "@chakra-ui/react";

import { useHookstate } from "@hookstate/core";
import { globalState, useGlobalState } from "../../../../state/store";
import { SubscriptionPlans } from "../../../components/interfaces";
import BillingPlanCard from "../../../components/onboarding/billing/BillingPlanCard";
import { useMutation, useQuery } from "@apollo/client";
import { GetSubscriptionPlans } from "../../../../apollo/subscriptionPlan";
import {
  ChangePaymentMethod,
  ChangeSubscriptionPlan,
  CreateUserPaymentSubscription,
} from "../../../../apollo/paymentQueries";
import { GetUserSubscriptionByUserId } from "../../../../apollo/userQueries";
import { ChangePaymentMethodModal } from "../../../components/paymentMethod/changePaymentMethodModal";
import { UserRolesEnum } from "../../../../constants/enums";
import { appConfig } from "../../../../config";
import { UserPermissions } from "../../../routes/permissionGuard";
import Swal from "sweetalert2";

export default function PaymentManagement() {
  const user = useHookstate(globalState.user);
  const { userPermissions } = useContext(UserPermissions);
  const [loadPlan, setLoadPlan] = useState("");
  const [stripeIdUser, setStripeIdUser] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [clientSecretPaymentMethod, setClientSecretPaymentMethod] =
    useState("");

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
  const [
    GetChangePaymentMethodSecret,
    {
      loading: GetChangePaymentMethodSecretLoading,
      error: GetChangePaymentMethodSecretError,
      data: GetChangePaymentMethodSecretData,
    },
  ] = useMutation(ChangePaymentMethod, {});
  const {
    loading: userSubscriptionLoading,
    error: userSubscriptionError,
    data: userSubscriptionData,
    refetch: RefetchSubscription,
  } = useQuery(GetUserSubscriptionByUserId, {
    variables: { id: user.value!.uid },
  });
  //Get subscription plans details from BE
  useQuery(GetSubscriptionPlans, {
    onCompleted: (response) => {
      setSubscriptionPlans(response.payments.getSubscriptionPlans);
    },
    onError: (error) => {
      console.log("ERROR FETCHING SUBSCRIPTION PLANS", error);
    },
  });

  const [CreatePaymentSubscription, CreatePaymentSubscriptionResp] =
    useMutation(CreateUserPaymentSubscription);
  const [ChangePaymentSubscription, ChangePaymentSubscriptionResp] =
    useMutation(ChangeSubscriptionPlan);

  useEffect(() => {
    if (
      userSubscriptionData &&
      userSubscriptionData.users &&
      userSubscriptionData.users.lookupSubscriptionPlan
    ) {
      setStripeIdUser(
        userSubscriptionData.users &&
          userSubscriptionData.users.lookupSubscriptionPlan
      );
    }
  }, [userSubscriptionData]);
  const handleBillingPlanCardClick = (planID) => {
    if (userPermissions.fullAccess || userPermissions.edit) {
      setLoadPlan(planID);
      ChangePaymentSubscription({
        variables: {
          userId: user.value!.uid,
          priceId: planID,
        },
        onCompleted: (resp) => {
          RefetchSubscription();
        },
      });
    } else {
      Swal.fire(
        "Not Allowed!",
        "You dont have permission to make changes!",
        "error"
      );
    }
  };
  const handlePaymentMethodChange = () => {
    GetChangePaymentMethodSecret({
      variables: {
        change: {
          id: user!.value?.uid,
          stakeholder: UserRolesEnum.USER,
        },
      },
      onCompleted: (res) => {
        if (
          res.payments &&
          res.payments.changePaymentMethod &&
          res.payments.changePaymentMethod.client_secret
        ) {
          setClientSecretPaymentMethod(
            res.payments.changePaymentMethod.client_secret
          );
        }
      },
    });
  };

  const RenderBillingCard = () => {
    return subscriptionPlans
      .filter(
        (subscription) => subscription.id !== appConfig.REACT_APP_FREE_TRIAL_ID
      )
      .map((plan, index) => (
        <BillingPlanCard
          activePlan={stripeIdUser === plan.id ? true : false}
          key={index}
          id={plan.id}
          title={plan.title}
          description={plan.description}
          amount={`$${Number(plan.cycleAmount) / plan.intervalCount}`}
          duration={`/${plan.intervalUnit}`}
          benefits={plan.benefits}
          handleClick={handleBillingPlanCardClick}
          loading={
            ChangePaymentSubscriptionResp.loading || userSubscriptionLoading
          }
          loadFor={loadPlan}
          stripeId={stripeIdUser}
        />
      ));
  };

  return (
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
              Payment Management
            </Text>
            <ChangePaymentMethodModal
              handleMethodChange={handlePaymentMethodChange}
              loading={GetChangePaymentMethodSecretLoading}
              clientSecret={clientSecretPaymentMethod}
            />
          </HStack>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <VStack>
            <HStack w='100%'>
              {/* UPDATE THIS BELOW TO SHOW ACTIVE PLAN WITH A DIFFERENT COLOR SO IT IS EASILY DISTINGUISHABLE. */}
              {RenderBillingCard()}
            </HStack>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}

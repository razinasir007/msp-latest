import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Text,
  GridItem,
  HStack,
  VStack,
  Card,
  CardBody,
  Button,
  CardHeader,
  Divider,
} from "@chakra-ui/react";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  DisconnectCalendar,
  GetCalendarIntegrationStatus,
  GetCalendarIntegrationUrl,
} from "../../../apollo/appointmentQueries";
import { IntegrationCard } from "../../components/shared/IntegrationCard";
import { useFirebaseAuth } from "../../auth";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { IntegrationServiceName } from "../../../constants/enums";
const CalendlyImg = require("../../../assets/calendly.png");
const AquityImg = require("../../../assets/aquity.png");
const StripeImg = require("../../../assets/stripe.png");
const PaypalImg = require("../../../assets/paypal.png");
const SquareImg = require("../../../assets/square1.png");

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export default function IntegrationApi() {
  const { user } = useFirebaseAuth();
  const [getCalendatIntegrationURL] = useLazyQuery(GetCalendarIntegrationUrl);
  const [disconnectCalendarIntegration] = useMutation(DisconnectCalendar);

  const {
    loading: calendlyStatLoading,
    error: calendlyStatError,
    data: calendlyStatus,
    startPolling: calendlyStartPolling,
    stopPolling: calendlyStopPolling,
  } = useQuery(GetCalendarIntegrationStatus, {
    variables: {
      serviceName: IntegrationServiceName.CALENDLY,
      userId: user?.uid,
    },
    onCompleted: (status) => {
      if (status.integrations.getIntegrationStatus === true) {
        calendlyStopPolling(); // Stop polling when calendlyStatus is true
      }
    },
  });

  const {
    loading: acuityStatLoading,
    error: acuityStatError,
    data: acuityStatus,
    startPolling: acuityStartPolling,
    stopPolling: acuityStopPolling,
  } = useQuery(GetCalendarIntegrationStatus, {
    variables: {
      serviceName: IntegrationServiceName.ACUITY,
      userId: user?.uid,
    },
    onCompleted: (status) => {
      if (status.integrations.getIntegrationStatus === true) {
        acuityStopPolling(); // Stop polling when acuityStatus is true
      }
    },
  });

  const {
    loading: stripeStatLoading,
    error: stripeStatError,
    data: stripeStatus,
    startPolling: stripeStartPolling,
    stopPolling: stripeStopPolling,
  } = useQuery(GetCalendarIntegrationStatus, {
    variables: {
      serviceName: IntegrationServiceName.STRIPE,
      userId: user?.uid,
    },
    onCompleted: (status) => {
      if (status.integrations.getIntegrationStatus === true) {
        stripeStopPolling(); // Stop polling when stripeStatus is true
      }
    },
  });
  const {
    loading: paypalStatLoading,
    error: paypalStatError,
    data: paypalStatus,
    startPolling: paypalStartPolling,
    stopPolling: paypalStopPolling,
  } = useQuery(GetCalendarIntegrationStatus, {
    variables: {
      serviceName: IntegrationServiceName.PAYPAL,
      userId: user?.uid,
    },
    onCompleted: (status) => {
      if (status.integrations.getIntegrationStatus === true) {
        paypalStopPolling(); // Stop polling when Paypal is true
      }
    },
  });
  const {
    loading: squareStatLoading,
    error: squareStatError,
    data: squareStatus,
    startPolling: squareStartPolling,
    stopPolling: squareStopPolling,
  } = useQuery(GetCalendarIntegrationStatus, {
    variables: {
      serviceName: IntegrationServiceName.SQUARE,
      userId: user?.uid,
    },
    onCompleted: (status) => {
      if (status.integrations.getIntegrationStatus === true) {
        squareStopPolling(); // Stop polling when Square is true
      }
    },
  });

  //The window.open function may not work as expected if it's called within an asynchronous context,
  //such as in the onCompleted callback of a GraphQL query.
  //Browsers often block pop-ups that are not directly triggered by
  //user interactions, and the behavior can vary depending on the browser's settings.
  function handleCalendlyConnect() {
    return getCalendatIntegrationURL({
      variables: {
        serviceName: IntegrationServiceName.CALENDLY,
        userId: user?.uid,
      },
    })
      .then((response) => {
        if (response.data)
          window.open(response.data.integrations.getIntegrationUrl);
      })
      .catch((error) => {
        console.error(error); // Handle any errors that occur during the request
      });
  }

  function handleAcuityConnect() {
    return getCalendatIntegrationURL({
      variables: {
        serviceName: IntegrationServiceName.ACUITY,
        userId: user?.uid,
      },
    })
      .then((response) => {
        if (response.data)
          window.open(response.data.integrations.getIntegrationUrl);
      })
      .catch((error) => {
        console.error(error); // Handle any errors that occur during the request
      });
  }

  function handleStripeConnect() {
    return getCalendatIntegrationURL({
      variables: {
        serviceName: IntegrationServiceName.STRIPE,
        userId: user?.uid,
      },
    })
      .then((response) => {
        if (response.data)
          window.open(response.data.integrations.getIntegrationUrl);
      })
      .catch((error) => {
        console.error(error); // Handle any errors that occur during the request
      });
  }
  function handlePayPalConnect() {
    return getCalendatIntegrationURL({
      variables: {
        serviceName: IntegrationServiceName.PAYPAL,
        userId: user?.uid,
      },
    })
      .then((response) => {
        if (response.data)
          window.open(response.data.integrations.getIntegrationUrl);
      })
      .catch((error) => {
        console.error(error); // Handle any errors that occur during the request
      });
  }
  function handleSquareConnect() {
    return getCalendatIntegrationURL({
      variables: {
        serviceName: IntegrationServiceName.SQUARE,
        userId: user?.uid,
      },
    })
      .then((response) => {
        if (response.data)
          window.open(response.data.integrations.getIntegrationUrl);
      })
      .catch((error) => {
        console.error(error); // Handle any errors that occur during the request
      });
  }

  function handleDisconnectCalendly() {
    return disconnectCalendarIntegration({
      variables: {
        serviceName: IntegrationServiceName.CALENDLY,
        userId: user?.uid,
      },
    });
  }

  function handleDisconnectAcuity() {
    return disconnectCalendarIntegration({
      variables: {
        serviceName: IntegrationServiceName.ACUITY,
        userId: user?.uid,
      },
    });
  }

  function handleDisconnectStripe() {
    return disconnectCalendarIntegration({
      variables: {
        serviceName: IntegrationServiceName.STRIPE,
        userId: user?.uid,
      },
    });
  }
  function handleDisconnectPayPal() {
    return disconnectCalendarIntegration({
      variables: {
        serviceName: IntegrationServiceName.PAYPAL,
        userId: user?.uid,
      },
    });
  }
  function handleDisconnectSquare() {
    return disconnectCalendarIntegration({
      variables: {
        serviceName: IntegrationServiceName.SQUARE,
        userId: user?.uid,
      },
    });
  }

  function getIntegrationInfo(name, isLoading, statusData, handleConnectClick) {
    const icon = !statusData && <ChevronRightIcon />;
    const title = statusData ? "Disconnect" : "Connect";

    return {
      name,
      isLoading,
      rightIcon: icon,
      title,
      handleConnectClick,
      img: getImageByName(name),
    };
  }

  function getImageByName(name) {
    switch (name) {
      case "Calendly":
        return CalendlyImg;
      case "Acuity Scheduling":
        return AquityImg;
      case "Stripe":
        return StripeImg;
      case "Paypal":
        return PaypalImg;
      case "Square":
        return SquareImg;
    }
  }

  useEffect(() => {
    // Start polling with a 2000ms (2 seconds) interval
    acuityStartPolling(2000);
    calendlyStartPolling(2000);
    stripeStartPolling(2000);
    paypalStartPolling(2000);
    squareStartPolling(2000);
    return () => {
      // Stop polling when the component unmounts
      acuityStopPolling();
      calendlyStopPolling();
      stripeStopPolling();
      paypalStopPolling();
      squareStopPolling();
    };
  }, [
    acuityStartPolling,
    acuityStopPolling,
    calendlyStartPolling,
    calendlyStopPolling,
    stripeStartPolling,
    stripeStopPolling,
    paypalStartPolling,
    paypalStopPolling,
    squareStartPolling,
    squareStopPolling,
  ]);

  const isCalendlyConnected =
    calendlyStatus?.integrations?.getIntegrationStatus;
  const isAcuityConnected = acuityStatus?.integrations?.getIntegrationStatus;
  const isStripeConnected = stripeStatus?.integrations?.getIntegrationStatus;
  const isPayPalConnected = paypalStatus?.integrations?.getIntegrationStatus;
  const isSquareConnected = squareStatus?.integrations?.getIntegrationStatus;

  const calendlyIntegration = getIntegrationInfo(
    "Calendly",
    calendlyStatLoading,
    isCalendlyConnected,
    isCalendlyConnected ? handleDisconnectCalendly : handleCalendlyConnect
  );

  const acuityIntegration = getIntegrationInfo(
    "Acuity Scheduling",
    acuityStatLoading,
    isAcuityConnected,
    isAcuityConnected ? handleDisconnectAcuity : handleAcuityConnect
  );

  const stripeIntegration = getIntegrationInfo(
    "Stripe",
    stripeStatLoading,
    isStripeConnected,
    isStripeConnected ? handleDisconnectStripe : handleStripeConnect
  );
  const paypalIntegration = getIntegrationInfo(
    "Paypal",
    paypalStatLoading,
    isPayPalConnected,
    isPayPalConnected ? handleDisconnectPayPal : handlePayPalConnect
  );
  const squareIntegration = getIntegrationInfo(
    "Square",
    squareStatLoading,
    isSquareConnected,
    isSquareConnected ? handleDisconnectSquare : handleSquareConnect
  );

  const showCalendars = !isCalendlyConnected || !isAcuityConnected;
  const showPaymentMethods =
    !isPayPalConnected || !isStripeConnected || !isSquareConnected;

  return (
    <Box>
      <Grid
        templateAreas={`"header"
        "content"`}
        gridTemplateRows={"75px 1fr"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <Text w='100%' fontSize='h2' fontWeight='semibold' lineHeight='35px'>
            API Integrations
          </Text>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          <VStack spacing='10px' alignItems='flex-start'>
            <Text w='100%' fontSize='p4'>
              The application listed below can be integrated with MyStudioPro
            </Text>
            {/* Connected APIS card */}
            <Card variant='outline' style={mainCardStyle}>
              <CardHeader padding='8px'>
                <Text fontSize='h5' fontWeight='semibold'>
                  Connected Integrations
                </Text>
              </CardHeader>
              <Divider width='100%' opacity={1} />
              <CardBody padding='8px' bg='#FCFCFA'>
                <HStack spacing='16px' width='100%'>
                  {isCalendlyConnected && (
                    <IntegrationCard {...calendlyIntegration} />
                  )}
                  {isAcuityConnected && (
                    <IntegrationCard {...acuityIntegration} />
                  )}
                  {isStripeConnected && (
                    <IntegrationCard {...stripeIntegration} />
                  )}
                  {isPayPalConnected && (
                    <IntegrationCard {...paypalIntegration} />
                  )}
                  {isSquareConnected && (
                    <IntegrationCard {...squareIntegration} />
                  )}
                </HStack>
                {!isCalendlyConnected &&
                  !isAcuityConnected &&
                  !isPayPalConnected &&
                  !isSquareConnected &&
                  !isStripeConnected && (
                    <VStack spacing='8px'>
                      <Text fontSize='h7' fontWeight='semibold'>
                        No connected APIs
                      </Text>
                      <Text fontSize='p5'>
                        You currently have no connected APIs
                      </Text>
                      <Button
                        rightIcon={<ChevronRightIcon />}
                        size='sm'
                        w='100%'
                      >
                        Search
                      </Button>
                    </VStack>
                  )}
              </CardBody>
            </Card>
            {/* Suggested Calendars API Card */}
            {showCalendars && (
              <Card variant='outline' style={mainCardStyle}>
                <CardHeader padding='8px'>
                  <Text fontSize='h5' fontWeight='semibold'>
                    Suggested Calendars
                  </Text>
                </CardHeader>
                <Divider width='100%' opacity={1} />
                <CardBody bg='#FCFCFA'>
                  <HStack spacing='16px' width='100%'>
                    {!isCalendlyConnected && (
                      <IntegrationCard {...calendlyIntegration} />
                    )}
                    {!isAcuityConnected && (
                      <IntegrationCard {...acuityIntegration} />
                    )}
                  </HStack>
                </CardBody>
              </Card>
            )}
            {/* Suggested Payment Methods API Card */}
            // Check if both Stripe and PayPal integrations are not connected
            {/* {!isStripeConnected && !isPayPalConnected && (
              <Card variant='outline' width={"50%"} style={mainCardStyle}>
                <CardHeader padding='8px'>
                  <Text fontSize='h5' fontWeight='semibold'>
                    Suggested Payment Methods
                  </Text>
                </CardHeader>
                <Divider width='100%' opacity={1} />
                <CardBody bg='#FCFCFA'>
                  <IntegrationCard {...stripeIntegration} />
                  <IntegrationCard {...paypalIntegration} />
                </CardBody>
              </Card>
            )} */}
            {showPaymentMethods && (
              <Card variant='outline' style={mainCardStyle}>
                <CardHeader padding='8px'>
                  <Text fontSize='h5' fontWeight='semibold'>
                    Suggested Payment Methods
                  </Text>
                </CardHeader>
                <Divider width='100%' opacity={1} />
                <CardBody bg='#FCFCFA'>
                  <HStack spacing='16px' width='100%'>
                    {!isPayPalConnected && (
                      <IntegrationCard {...paypalIntegration} />
                    )}
                    {!isStripeConnected && (
                      <IntegrationCard {...stripeIntegration} />
                    )}
                    {!isSquareConnected && (
                      <IntegrationCard {...squareIntegration} />
                    )}
                  </HStack>
                </CardBody>
              </Card>
            )}
            // Check if Stripe is not connected but PayPal is connected
            {/* {!isPayPalConnected && (
              <Card variant='outline' width={"50%"} style={mainCardStyle}>
                <CardHeader padding='8px'>
                  <Text fontSize='h5' fontWeight='semibold'>
                    Suggested Payment Methods
                  </Text>
                </CardHeader>
                <Divider width='100%' opacity={1} />
                <CardBody bg='#FCFCFA'>
                  <IntegrationCard {...paypalIntegration} />
                </CardBody>
              </Card>
            )} */}
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}

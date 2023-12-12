import React, { useEffect } from "react";
import {
  Card,
  CardBody,
  Center,
  VStack,
  Text,
  Button,
  CardHeader,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { FaStripe } from "react-icons/fa";
import { IntegrationCard } from "../../../components/shared/IntegrationCard";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  DisconnectCalendar,
  GetCalendarIntegrationStatus,
  GetCalendarIntegrationUrl,
} from "../../../../apollo/appointmentQueries";
import { useFirebaseAuth } from "../../../auth";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { IntegrationServiceName } from "../../../../constants/enums";

const StripeImg = require("../../../../assets/stripe.png");
const PaypalImg = require("../../../../assets/paypal.png");
const SquareImg = require("../../../../assets/square1.png");

const mainCardStyle = {
  padding: "0",
  width: "50%",
  borderRadius: "4px",
  borderColor: "#E2E8F0",
  background: "#FCFCFA",
  marginTop: "30px",
};

const Payments = () => {
  const { user } = useFirebaseAuth && useFirebaseAuth();

  const [getCalendatIntegrationURL] = useLazyQuery(GetCalendarIntegrationUrl);
  const [disconnectCalendarIntegration] = useMutation(DisconnectCalendar);

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
        squareStopPolling(); // Stop polling when Paypal is true
      }
    },
  });

  useEffect(() => {
    // Start polling with a 2000ms (2 seconds) interval
    stripeStartPolling(2000);
    paypalStartPolling(2000);
    squareStartPolling(2000);
    return () => {
      // Stop polling when the component unmounts
      stripeStopPolling();
      paypalStopPolling();
      squareStopPolling();
    };
  }, [
    stripeStartPolling,
    stripeStopPolling,
    paypalStartPolling,
    paypalStopPolling,
    squareStartPolling,
    squareStopPolling,
  ]);

  const isStripeConnected = stripeStatus?.integrations?.getIntegrationStatus;
  const isPayPalConnected = paypalStatus?.integrations?.getIntegrationStatus;
  const isSquareConnected = squareStatus?.integrations?.getIntegrationStatus;

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
      case "Stripe":
        return StripeImg;
      case "Paypal":
        return PaypalImg;
      case "Square":
        return SquareImg;
    }
  }
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

  return (
    <Center>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader pb='8px'>
          <Flex width='100%' justifyContent='center'>
            <Text fontSize='h5' fontWeight='semibold'>
              Organization Payments
            </Text>
          </Flex>
        </CardHeader>
        <CardBody pt='8px'>
          <VStack spacing='16px'>
            <Text fontSize='p5' fontWeight='400'>
              Location where my money is going when collected
            </Text>
            <HStack width='100%'>
              <IntegrationCard {...stripeIntegration} />
              <IntegrationCard {...paypalIntegration} />
              <IntegrationCard {...squareIntegration} />
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </Center>
  );
};

export default Payments;

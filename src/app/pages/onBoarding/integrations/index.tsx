import React, { useEffect } from "react";
import {
  Card,
  CardBody,
  Center,
  Text,
  HStack,
  CardHeader,
  Flex,
} from "@chakra-ui/react";

import { IntegrationCard } from "../../../components/shared/IntegrationCard";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GetCalendarIntegrationStatus,
  GetCalendarIntegrationUrl,
} from "../../../../apollo/appointmentQueries";
import { useFirebaseAuth } from "../../../auth";
import { ChevronRightIcon, CheckIcon } from "@chakra-ui/icons";
import { IntegrationServiceName } from "../../../../constants/enums";

const CalendlyImg = require("../../../../assets/calendly.png");
const AquityImg = require("../../../../assets/aquity.png");

const mainCardStyle = {
  padding: "0",
  width: "50%",
  borderRadius: "4px",
  borderColor: "#E2E8F0",
  background: "#FCFCFA",
  marginTop: "30px",
};

const Integrations = () => {
  const { user } = useFirebaseAuth && useFirebaseAuth();
  const [getCalendatIntegrationURL] = useLazyQuery(GetCalendarIntegrationUrl);

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

  function getIntegrationInfo(name, isLoading, statusData, handleConnectClick) {
    const icon = statusData ? <CheckIcon /> : <ChevronRightIcon />;
    const title = statusData ? "Integrated" : "Connect";

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
    }
  }

  useEffect(() => {
    // Start polling with a 2000ms (2 seconds) interval
    acuityStartPolling(2000);
    calendlyStartPolling(2000);
    return () => {
      // Stop polling when the component unmounts
      acuityStopPolling();
      calendlyStopPolling();
    };
  }, [
    acuityStartPolling,
    acuityStopPolling,
    calendlyStartPolling,
    calendlyStopPolling,
  ]);

  const isCalendlyConnected =
    calendlyStatus?.integrations?.getIntegrationStatus;
  const isAcuityConnected = acuityStatus?.integrations?.getIntegrationStatus;

  const calendlyIntegration = getIntegrationInfo(
    "Calendly",
    calendlyStatLoading,
    isCalendlyConnected,
    handleCalendlyConnect
  );

  const acuityIntegration = getIntegrationInfo(
    "Acuity Scheduling",
    acuityStatLoading,
    isAcuityConnected,
    handleAcuityConnect
  );

  return (
    <Center>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader pb='8px'>
          <Flex width='100%' justifyContent='center'>
            <Text fontSize='h5' fontWeight='semibold'>
              Connect your Calendars
            </Text>
          </Flex>
        </CardHeader>
        <CardBody pt='8px'>
          <HStack width='100%'>
            <IntegrationCard {...calendlyIntegration} />
            <IntegrationCard {...acuityIntegration} />
          </HStack>
        </CardBody>
      </Card>
    </Center>
  );
};

export default Integrations;

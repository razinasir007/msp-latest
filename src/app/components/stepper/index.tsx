import React, { useEffect, useState } from "react";
import { Step, Steps, useSteps } from "chakra-ui-steps";

import {
  Flex,
  Heading,
  Button,
  Box,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { GoDotFill } from "react-icons/go";
import { Uploader } from "../imageUploader";
import { PresentationView } from "../imagePresentation";
import { ProductionSelection } from "../productSelection";
import { Checkout } from "../checkoutForm";
import { globalState, useGlobalState } from "../../../state/store";
import { useMutation, useQuery } from "@apollo/client";
import { GetProductDetailWithOptionsByOrgID } from "../../../apollo/productQueries";
import { ProductDetails } from "../interfaces";
import { useHookstate } from "@hookstate/core";

import { useLocation } from "react-router-dom";
import { CreateOrder } from "../../../apollo/orderQueries";
import { GetRoomViewImagesByOrgId } from "../../../apollo/organizationQueries";
import { RoomDetails } from "../../../state/interfaces";
import { OrderStageEnum, StageEnum } from "../../../constants/enums";

export const HorizontalStepper = () => {
  const stateUser = useHookstate(globalState.user);
  const orderId = localStorage.getItem("OrderId");
  const state_global = useGlobalState();
  const uploadedImages = state_global.getImages();
  const { state } = useLocation();
  const [error, setError] = useState(false);
  const draftOrderItem = localStorage.getItem("DraftOrder");
  const draftOrder = JSON.parse(draftOrderItem);
  const [productDetalsState, setProductsDetailsState] = useState<
    Array<ProductDetails>
  >([]);
  localStorage.setItem("DraftOrder", JSON.stringify(state));
  const currentDate = new Date();
  const dueDatePolicy = stateUser!.value!.organization!.dueDatePolicy;
  const dueDate = new Date(currentDate);
  dueDate.setDate(currentDate.getDate() + dueDatePolicy);
  const [OrderCreate, GetOrderResponse] = useMutation(CreateOrder);
  const steps = [
    {
      label: "Upload",
      view: <Uploader />,
    },
    {
      label: "Presentation",
      view: <PresentationView clientFullName={state.client.fullname} />,
    },
    {
      label: "Product Selection",
      view: <ProductionSelection productsDetails={productDetalsState} />,
    },
    {
      label: "Checkout",
      view: <Checkout user={stateUser.value} client={state.client} />,
    },
  ];

  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  const { data: productsData, loading: productsLoading } = useQuery(
    GetProductDetailWithOptionsByOrgID,
    {
      variables: { orgId: stateUser.value?.organization?.id },
    }
  );
  const { data: customRoomData, loading: customroomLoading } = useQuery(
    GetRoomViewImagesByOrgId,
    {
      variables: {
        orgId: stateUser.value?.organization?.id,
        photoType: StageEnum.RESIZED,
      },
    }
  );
  useEffect(() => {
    if (productsData) {
      const formattedData =
        productsData.productDetails.lookupProductDetailsByOrganization.map(
          (product) => ({
            id: product.id,
            title: product.title,
            description: product.description,
            variants: product.numberOfOptions,
            status: {
              value: product.isActive,
              label: product.isActive ? "Active" : "Inactive",
            },
            flatPrice: product.flatPrice,
            flatCost: product.flatCost,
            regularOptions: product.regularOptions,
            reservedOptions: product.reservedOptions,
          })
        );
      setProductsDetailsState(formattedData);
    }
  }, [productsData]);

  useEffect(() => {
    if (
      customRoomData &&
      customRoomData.roomView &&
      customRoomData.roomView.lookupByOrganization
    ) {
      const customRoomImages = customRoomData.roomView.lookupByOrganization.map(
        (details) => {
          return {
            id: details.id,
            imageUrl: `data:image/png;base64,${details.content}`,
            ppi: details.ppi,
            anchorPoints: {
              x: details.x,
              y: details.y,
            },
            type: details.type,
          };
        }
      );
      state_global.setToolCustomRooms(customRoomImages);
    }
  }, [customRoomData]);

  const handleNext = (activeStep: number) => {
    switch (activeStep) {
      case 0:
        if (uploadedImages.length !== 0) {
          if (!draftOrder.order) {
            OrderCreate({
              variables: {
                createdBy: stateUser!.value!.uid,
                order: {
                  clientId: state.client.id,
                  id: orderId,
                  userId: stateUser!.value!.uid,
                  orgId: stateUser.value?.organization?.id,
                  locationId: stateUser!.value!.storeLocId,
                  stage: OrderStageEnum.DRAFT,
                  dueDate: dueDate,
                },
              },
            });
          }

          setError(false);
          nextStep();
        } else {
          setError(true);
        }
        break;

      case 1:
        !productsLoading && nextStep();
        break;
      case 2:
        nextStep();
        break;
      case 3:
        nextStep();
        break;
    }
  };

  return (
    <Flex flexDir='column' height='100vh' width='100%'>
      <Steps
        activeStep={activeStep}
        variant='circles'
        checkIcon={GoDotFill}
        size='sm'
        colorScheme=''
      >
        {steps.map(({ label, view }, index) => (
          <Step label={label} key={index} icon={GoDotFill}>
            {error ? (
              <Center>
                <Alert status='error'>
                  <AlertIcon />
                  <AlertTitle>Error while proceeding!</AlertTitle>
                  <AlertDescription>
                    Please upload images to proceed.
                  </AlertDescription>
                </Alert>
              </Center>
            ) : (
              <></>
            )}
            {view}
          </Step>
        ))}
      </Steps>

      <Box>
        {activeStep === steps.length ? (
          <Flex px={4} py={4} width='100%' flexDirection='column'>
            <Heading fontSize='xl' textAlign='center'>
              Woohoo! All steps completed!
            </Heading>
            <Button
              mx='auto'
              mt={6}
              size='sm'
              variant='outline'
              onClick={reset}
            >
              Reset
            </Button>
          </Flex>
        ) : (
          <Flex width='100%' justify='right' py={2}>
            <Button
              isDisabled={activeStep === 0}
              mr={4}
              onClick={prevStep}
              size='sm'
              variant='outline'
            >
              Prev
            </Button>
            {activeStep !== steps.length - 1 && (
              <Button
                size='sm'
                variant='solid'
                onClick={() => {
                  handleNext(activeStep);
                }}
              >
                Next
              </Button>
            )}
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default HorizontalStepper;

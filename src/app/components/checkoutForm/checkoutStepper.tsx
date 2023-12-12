import React, { useEffect, useState } from "react";
import { Step, Steps, useSteps } from "chakra-ui-steps";
import { useNavigate } from "react-router-dom";
import { Flex, Heading, Button, Box } from "@chakra-ui/react";
import { GoDotFill } from "react-icons/go";
import { AddressForm } from "./addressForm";
import { PaymentForm } from "./paymentForm";
import { Review } from "./review";
import { CostBreakdown } from "./costBreakdown";

import {
  CreateClientPaymentSubscription,
  CreateClientFullPayment,
} from "../../../apollo/paymentQueries";
import { useMutation } from "@apollo/client";
import { useHookstate } from "@hookstate/core";
import { globalState, useGlobalState } from "../../../state/store";
import { v4 as uuidv4 } from "uuid";
import { UpdateOrder } from "../../../apollo/orderQueries";
import { CreateInvoice } from "../../../apollo/invoices";
import Swal from "sweetalert2";
import { OrderCheckoutForm } from "./orderCheckoutForm";
import {
  CreateActualProduct,
  CreateOrUpdateProductTodoList,
} from "../../../apollo/productQueries";

import currency from "currency.js";
import { OrderStageEnum, PaymentTypeEnum } from "../../../constants/enums";
import PaymentSelection from "./paymentSelection";
import { CreateOrderPackagesMutation } from "../../../apollo/packageQueries";

interface ShippingDetailsValues {
  fName: string;
  lName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  zipCode: string;
  country: string;
  useDetailsCheck?: boolean;
}

// const orderId: string = uuidv4();
const invoiceId: string = uuidv4();

export function CheckoutStepper(props: { client }) {
  const OrderId = localStorage.getItem("OrderId");
  const { client } = props;
  const stateUser = useHookstate(globalState.user);
  const navigate = useNavigate();
  const wrappedState = useGlobalState();
  const products = wrappedState.getAllProducts();
  const [packages, setPackages] = useState<any>([]);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentKey, setPaymentKey] = useState("");

  const [paymentSetupMessage, setPaymentSetupMessage] = useState("");
  const [paymentIntent, setPaymentIntent] = useState("");

  // type of payment chosen: full or subscription
  const [paymentType, setPaymentType] = useState(PaymentTypeEnum.FULL);

  // Needed for subscription type payment
  const [paymentInterval, setPaymentInterval] = useState({
    title: "",
    value: "",
  });
  const [paymentDuration, setPaymentDuration] = useState(1);
  const [cycleAmount, setCycleAmount] = useState(0);

  // Needed for full type payment
  const [fullAmount, setFullAmount] = useState(0);

  //needed for invoicing
  const [additionalCost, setAdditionalCost] = useState({
    shipping: "",
    tax: "",
    retainer: "",
    flatDiscount: 0,
    percDiscount: 0,
    percDiscAmount: "",
  });
  const [subtotalCost, setSubTotalCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  //to confirm if the form is submitted before going to next step
  const [checkoutFormSubmitted, setCheckoutFormSubmitted] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const currentDate = new Date();
  const dueDatePolicy = stateUser!.value!.organization!.dueDatePolicy;
  const dueDate = new Date(currentDate);
  dueDate.setDate(currentDate.getDate() + dueDatePolicy);

  const [GetClientSecret, ClientSecretResponse] = useMutation(
    CreateClientPaymentSubscription
  );
  const [GetFullPaymentClientSecret, GetFullPaymentResponse] = useMutation(
    CreateClientFullPayment
  );

  const [OrderUpdate, GetOrderResponse] = useMutation(UpdateOrder);
  const [ProductsCreate, GetProductsResponse] =
    useMutation(CreateActualProduct);
  const [createPackages, CreatePackageResponse] = useMutation(
    CreateOrderPackagesMutation
  );
  const [CreateProductTodo, GetTodoResponse] = useMutation(
    CreateOrUpdateProductTodoList
  );
  const [InvoiceCreate, GetInvoiceResponse] = useMutation(CreateInvoice);

  const { nextStep, prevStep, reset, activeStep } = useSteps({
    initialStep: 0,
  });

  const [shipDetails, setShipDetails] = useState<ShippingDetailsValues>({
    fName: "",
    lName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    zipCode: "",
    country: "",
    useDetailsCheck: true,
  });
  const steps = [
    {
      label: "Invoice",
      view: (
        <CostBreakdown
          packages={packages}
          setPackages={setPackages}
          setPaymentType={setPaymentType}
          paymentInterval={paymentInterval}
          setPaymentInterval={setPaymentInterval}
          paymentDuration={paymentDuration}
          setPaymentDuration={setPaymentDuration}
          setCycleAmount={setCycleAmount}
          setFullAmount={setFullAmount}
          additionalCost={additionalCost}
          setAdditionalCost={setAdditionalCost}
          totalCost={totalCost}
          setTotalCost={setTotalCost}
          subtotalCost={subtotalCost}
          setSubTotalCost={setSubTotalCost}
          taxAmount={taxAmount}
          setTaxAmount={setTaxAmount}
        />
      ),
    },
    {
      label: "Shipping address",
      view: (
        <AddressForm
          shipDetails={shipDetails}
          setShipDetails={setShipDetails}
        />
      ),
    },

    {
      label: "Payment Method Selection",
      view: (
        <Box>
          <PaymentSelection
            paymentType={paymentType}
            selectedMethod={selectedMethod}
            setSelectedMethod={setSelectedMethod}
          />
        </Box>
      ),
    },
    {
      label: "Payment details",
      view: (
        <PaymentForm
          orderId={OrderId}
          clientId={client.id}
          amount={fullAmount}
          selectedMethod={selectedMethod}
          clientSecret={clientSecret}
          paymentKey={paymentKey}
          paymentSetupMessage={paymentSetupMessage}
          setPaymentSetupMessage={setPaymentSetupMessage}
          setPaymentIntent={setPaymentIntent}
          paymentIntent={paymentIntent}
        />
      ),
    },
    {
      label: "Terms & Conditions",
      view: (
        <Box>
          <OrderCheckoutForm
            setCheckoutFormSubmitted={setCheckoutFormSubmitted}
            checkoutFormSubmitted={checkoutFormSubmitted}
            clientId={client.id}
            orderId={OrderId}
          />
        </Box>
      ),
    },
    {
      label: "Review your order",
      view: <Review shipDetails={shipDetails} />,
    },
  ];
  const handleNext = (activeStep: number) => {
    switch (activeStep) {
      case 0:
        nextStep();
        break;
      case 1:
        nextStep();

        break;
      case 2:
        switch (selectedMethod) {
          case "Stripe":
            if (paymentSetupMessage !== "succeeded") {
              if (paymentType === PaymentTypeEnum.FULL) {
                GetFullPaymentClientSecret({
                  variables: {
                    createdBy: stateUser!.value!.uid,
                    paymentInput: {
                      amount: fullAmount,
                      currency: "USD",
                      clientId: client.id,
                      orderId: OrderId,
                    },
                  },
                  onCompleted: (response) => {
                    if (response) {
                      if (response.payments.createClientFullPayment) {
                        setClientSecret(
                          response.payments.createClientFullPayment.clientSecret
                        );
                        setPaymentKey(
                          response.payments.createClientFullPayment.paymentKey
                        );
                      }
                      nextStep();
                    }
                  },
                });
              } else {
                GetClientSecret({
                  variables: {
                    createdBy: stateUser!.value!.uid,
                    paymentSubscription: {
                      clientId: client.id,
                      orderId: OrderId,
                      intervalUnit: paymentInterval.value,
                      intervalCount: 1,
                      cycles: parseInt(paymentDuration),
                      // cycles: 5,
                      cycleAmount: cycleAmount.toString(),
                      currency: "USD",
                      active: true,
                      recurring: true,
                    },
                  },
                  onCompleted: (response) => {
                    if (response) {
                      if (response.payments.createClientPaymentSubscription) {
                        setClientSecret(
                          response.payments.createClientPaymentSubscription
                            .clientSecret
                        );
                        setPaymentKey(
                          response.payments.createClientPaymentSubscription
                            .paymentKey
                        );
                      }
                      nextStep();
                    }
                  },
                });
              }
            } else {
              nextStep();
            }
            break;
          case "Square":
            console.log("square");
            nextStep();
            break;
          case "PayPal":
            console.log("paypallll");
            nextStep();
            break;
        }
        break;
      case 3:
        nextStep();
        break;

      case 4:
        nextStep();
        break;
      case 5:
        // (async function () {
        //   try {
        //     const pdfBlob = await PurchaseOrderPdf({
        //       products,
        //     });
        //     //converts the blob into a file object
        //     const pdfFile = new File([pdfBlob], "PurchaseOrder.pdf", {
        //       type: "application/pdf",
        //     });
        //     const pdfUrl = URL.createObjectURL(pdfFile);

        //     window.open(pdfUrl, "_blank");
        //   } catch (error) {
        //     Swal.fire({
        //       icon: "error",
        //       title: "Form submission failed.",
        //       text: error,
        //     });
        //   }
        // })();
        const invoiceParams = {
          id: invoiceId,
          orderId: OrderId,
          shippingAmountSubunits: currency(additionalCost.shipping).multiply(
            100
          ).value,
          salesTaxAmountSubunits: currency(taxAmount).multiply(100).value,
          currency: "USD",
          discountAmountPercentage: additionalCost.percDiscount,
          discountAbsoluteAmountSubunits:
            additionalCost.percDiscount > 0
              ? 0
              : currency(additionalCost.flatDiscount).multiply(100).value,
          paidAmountSubunits: currency(additionalCost.retainer).multiply(100)
            .value,
          orderSubtotalAmountSubunits:
            currency(subtotalCost).multiply(100).value,
          totalAmountSubunits: currency(totalCost).multiply(100).value,
        };

        OrderUpdate({
          variables: {
            updatedBy: stateUser!.value!.uid,
            order: {
              clientId: client.id,
              id: OrderId,
              userId: stateUser!.value!.uid,
              orgId: stateUser.value?.organization?.id,
              locationId: stateUser!.value!.storeLocId,
              stage: OrderStageEnum.OPEN,
              dueDate: dueDate,
            },
          },
          onCompleted: (res) => {
            if (res.orders.update === true) {
              InvoiceCreate({
                variables: {
                  createdBy: stateUser!.value!.uid,
                  invoice: invoiceParams,
                },
                onCompleted: () => {
                  nextStep();
                },
              });
              //create products
              if (products.length > 0) {
                products.map((product) => {
                  const variants: Array<{
                    fieldId: string;
                    fieldName: string;
                    fieldValue: string;
                    fieldWidth?: string;
                    fieldPrice: string;
                    fieldCost: string;
                    id: string;
                    productId: string;
                  }> = [];

                  if (product.size) {
                    variants.push({
                      id: uuidv4(),
                      fieldId: product.size.id,
                      fieldName: "Size",
                      fieldValue: product.size.value,
                      fieldPrice: product.size.price,
                      fieldCost: product.size.cost,
                      productId: product.id,
                    });
                  }

                  if (product.frame.value !== "") {
                    variants.push({
                      id: uuidv4(),
                      fieldId: product.frame.id,
                      fieldName: "Frame",
                      fieldValue: product.frame.value,
                      fieldWidth: product.frame.frameWidth,
                      fieldPrice: product.frame.price,
                      fieldCost: product.frame.cost,
                      productId: product.id,
                    });
                  }

                  if (product.matting.value !== "") {
                    variants.push({
                      id: uuidv4(),
                      fieldId: product.matting.id,
                      fieldName: "Matting",
                      fieldValue: product.matting.value,
                      fieldPrice: product.matting.price,
                      fieldCost: product.matting.cost,
                      productId: product.id,
                    });
                  }

                  ProductsCreate({
                    variables: {
                      createdBy: stateUser!.value!.uid,
                      product: {
                        id: product.id,
                        notes: product.note,
                        orderId: OrderId,
                        photoId: product.photo.id,
                        productDetailId: product.productDetails.id,
                        variants: variants,
                      },
                    },
                    onCompleted: (res) => {
                      if (res.products.createProduct === true) {
                        if (product.todoList !== undefined) {
                          CreateProductTodo({
                            variables: {
                              createdBy: stateUser!.value!.uid,
                              productId: product.id,
                              todos: product.todoList,
                            },
                          });
                        }
                      }
                    },
                  });
                });
              }
              if (packages.length > 0) {
                let sizeList = [];
                const orderItemPackagesList = packages.map((packagee) => {
                  let orderItemPackageId = uuidv4();
                  const packageSizes = packagee.sizes.map((sizeObj) => {
                    return {
                      orderItemPackageId: orderItemPackageId,
                      packageSizeId: sizeObj.size.id,
                      photoId: sizeObj.images.map((img) => img.id),
                    };
                  });
                  sizeList = sizeList.concat(packageSizes);
                  return {
                    id: orderItemPackageId,
                    orderId: OrderId,
                    packageId: packagee.id,
                    quantity: packagee.quantity,
                    price: packagee.price,
                    description: packagee.description,
                  };
                });

                // const packagePayload = {
                //   createdBy: stateUser.value?.uid,
                //   orderItemPackages: orderItemPackagesList,
                //   sizes: sizeList,
                // };
                createPackages({
                  variables: {
                    createdBy: stateUser.value?.uid,
                    orderItemPackages: orderItemPackagesList,
                    sizes: sizeList,
                  },
                  onCompleted: (res) => {
                    console.log(res);
                  },
                });
              }
            } else {
              Swal.fire({
                icon: "error",
                titleText: "Error",
                text: "Error while creating the order!",
              });
            }
          },
        });

        break;
    }
  };

  return (
    <Box width='100%'>
      <Steps
        activeStep={activeStep}
        variant='circles'
        checkIcon={GoDotFill}
        size='sm'
        colorScheme=''
      >
        {steps.map(({ label, view }, index) => (
          <Step label={label} key={index} icon={GoDotFill}>
            {view}
          </Step>
        ))}
      </Steps>

      <Box>
        {activeStep === steps.length ? (
          <Flex px={4} py={4} width='100%' flexDirection='column'>
            <Heading fontSize='xl' textAlign='center'>
              Dear {client.fullname ? `${client.fullname} ` : "customer"}, thank
              you for your order. Your order number is #{`${OrderId}`}. We have
              emailed your order confirmation with the invoice, and will send
              you an update when your order has shipped.
            </Heading>
            <Button
              mx='auto'
              mt={6}
              size='sm'
              onClick={() => {
                navigate(-1);
                wrappedState.setPaymentCheck(false);
                wrappedState.deleteAllImages();
                wrappedState.removeAllProducts();
                wrappedState.removeClientDetail;
              }}
              variant='outline'
            >
              Go to orders
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
            <Button
              size='sm'
              isLoading={
                ClientSecretResponse.loading || GetFullPaymentResponse.loading
              }
              isDisabled={
                activeStep === 4
                  ? checkoutFormSubmitted
                    ? false
                    : true
                  : false
              }
              onClick={() => {
                handleNext(activeStep);
              }}
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Flex>
        )}
      </Box>
    </Box>
  );
}

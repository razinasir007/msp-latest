import React, { useEffect, useState } from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Card,
  CardHeader,
  Flex,
  Spacer,
  CardBody,
  Divider,
  SimpleGrid,
  Select,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Checkbox,
  Grid,
  GridItem,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { globalState, useGlobalState } from "../../../state/store";
import { LabeledInput } from "../shared/labeledInput";
import { MdCancel, MdDiscount, MdLocalShipping } from "react-icons/md";

import {
  TbReceiptTax,
  TbDiscount2,
  TbDiscountCheckFilled,
} from "react-icons/tb";
import { IoIosCash } from "react-icons/io";
import { BiSolidCommentAdd } from "react-icons/bi";
import { SelectDropdown } from "../shared/selectDropdown";
import { useQuery } from "@apollo/client";
import { GetLocationSalesTaxByLocId } from "../../../apollo/organizationQueries";
import { useHookstate } from "@hookstate/core";
import currency from "currency.js";
import { InvoiceItemCard } from "./invoiceItemCard/InvoiceItemCard";
import { SelectPackage } from "./selectPackage";
import { LuPackagePlus } from "react-icons/lu";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { GrFormDown, GrFormUp } from "react-icons/gr";
import { EditPackageModal } from "./editPackageModal";

let formatCurrency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

let formatPercentage = new Intl.NumberFormat(undefined, {
  style: "percent",
  minimumFractionDigits: 2,
});

const paymentIntervalConst = [
  {
    title: "Weekly",
    value: "week",
  },
  {
    title: "Monthly",
    value: "month",
  },
];

const paymentPrefOption = [
  {
    name: "Full Payment",
    value: "full",
  },
  {
    name: "Subscription Plans",
    value: "subscription",
  },
];

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export const CostBreakdown = (props: {
  setPaymentType;
  paymentInterval?;
  setPaymentInterval?;
  paymentDuration?;
  setPaymentDuration?;
  setCycleAmount?;
  setFullAmount?;
  additionalCost;
  setAdditionalCost;
  totalCost;
  setTotalCost;
  subtotalCost;
  setSubTotalCost;
  taxAmount;
  setTaxAmount;
  packages;
  setPackages;
}) => {
  const {
    setPaymentType,
    paymentInterval,
    setPaymentInterval,
    paymentDuration,
    setPaymentDuration,
    setCycleAmount,
    setFullAmount,
    additionalCost,
    setAdditionalCost,
    totalCost,
    setTotalCost,
    subtotalCost,
    setSubTotalCost,
    taxAmount,
    setTaxAmount,
    packages,
    setPackages,
  } = props;

  const wrappedState = useGlobalState();
  const stateUser = useHookstate(globalState.user);
  const products = wrappedState.getAllProducts();
  const presentationImages = wrappedState.getPresentationImages();
  const user = wrappedState.getUserProfile();
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [productState, setProductState] = useState({});
  const [addPackages, setAddPackages] = useState(false);
  const [note, setNote] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [paymentPreference, setPaymentPreference] = useState({
    label: "Full Payment",
    value: "full",
  });

  const {
    loading: salesTaxLoading,
    error: salesTaxError,
    data: salesTaxData,
  } = useQuery(GetLocationSalesTaxByLocId, {
    variables: { locId: stateUser!.value!.storeLocId },
  });

  useEffect(() => {
    if (salesTaxData) {
      const updatedAdditionalCost = {
        ...additionalCost,
        tax: salesTaxData?.locationSalesTax?.lookup?.salesTaxPercentage,
      };
      setAdditionalCost(updatedAdditionalCost);
    }
  }, [salesTaxData]);

  //Add the prices of each variant of the selected product and set the total cost
  useEffect(() => {
    let tempPrice = 0;
    if (products && products.length > 0) {
      tempPrice = products.reduce((accumulator, product) => {
        const { productOptionsPrices } = product;

        const optionsPrices = Object.values(productOptionsPrices);

        const productPrice = optionsPrices.reduce((total, price) => {
          const optionPrice = isNaN(price) ? 0 : price;
          return total + optionPrice;
        }, 0);
        return accumulator + productPrice;
      }, tempPrice);
    }

    //  NEW ADDITION FOR PACKAGES (OPENED)
    if (packages && packages.length > 0) {
      const packagePrice = packages.reduce((total, packagee) => {
        // Calculate price for each package (package.price * package.quantity)
        const packageTotalPrice = packagee.price * packagee.quantity;
        return total + packageTotalPrice;
      }, 0);

      // Add packagePrice to tempPrice
      tempPrice += packagePrice;
    }
    // NEW ADDITION FOR PACKAGES (CLOSED)

    //this is the subtotal-> sum of price of all products...
    setSubTotalCost(tempPrice);

    // const additionalCostValues = Object.values(additionalCost);
    // const additionalCostSum = additionalCostValues.reduce(
    //   (accumulator, value) => accumulator + value,
    //   0
    // );

    const additionalCostSum = Object.entries(additionalCost).reduce(
      (accumulator, [key, value]) => {
        if (key === "percDiscount") {
          return accumulator;
        } else if (key === "percDiscAmount") {
          return currency(accumulator).subtract(value).value;
          //without using currency.js
          // return accumulator - value;
        } else if (key === "tax") {
          return accumulator;
        } else if (key === "flatDiscount" || key === "retainer") {
          return currency(accumulator).subtract(value).value;
        }
        //without using currency.js
        // return accumulator + value;
        return currency(accumulator).add(value).value;
      },
      0
    );

    setTaxAmount(
      currency(currency(additionalCostSum).add(tempPrice).value).multiply(
        currency(additionalCost.tax).divide(100).value
      ).value
    );
    setTotalCost(
      currency(additionalCostSum).add(
        currency(tempPrice).add(
          currency(currency(additionalCostSum).add(tempPrice).value).multiply(
            currency(additionalCost.tax).divide(100).value
          ).value
        ).value
      ).value
    );
    //without using currency.js
    // setTaxAmount((additionalCostSum + tempPrice) * (additionalCost.tax / 100));
    //without using currency.js
    // setTotalCost(
    //   additionalCostSum +
    //     tempPrice +
    //     (additionalCostSum + tempPrice) * (additionalCost.tax / 100)
    // );
  }, [products, additionalCost, packages]);

  useEffect(() => {
    //without using currency.js
    // setCycleAmount(totalCost / paymentDuration);
    setCycleAmount(currency(totalCost).divide(paymentDuration).value);
    setFullAmount(totalCost);
  }, [totalCost, paymentDuration]);

  const handlePriceChange = (event) => {
    const { name, value } = event.target;
    const parsedValue = Number(value);
    let newValue;
    if (name === "retainer" || name === "flatDiscount") {
      newValue = parsedValue;
    } else {
      newValue = parsedValue;
    }
    setAdditionalCost((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };

  // const handlePricePercentageChange = (event) => {
  //   const { name, value } = event.target;
  //   const parsedValue = Number(value) / 100;
  //   const discountAmount = totalCost * parsedValue;
  //   const newTotal = totalCost - discountAmount;

  //   setTotalCost((prevTotal) => prevTotal - discountAmount);
  // };

  const handlePaymentIntervalChange = (event) => {
    const { value } = event.target;
    const selectedInterval = paymentIntervalConst.find(
      (option) => option.value === value
    );
    // console.log("paymentInterval:", paymentInterval)
    if (selectedInterval) {
      setPaymentInterval(selectedInterval);
    }
  };

  const handlePaymentDuration = (event) => {
    const { value } = event.target;
    let restrictedValue = value;

    if (paymentInterval.value === "WEEK") {
      // Restrict input to numbers between 1 and 52
      restrictedValue = Math.max(1, Math.min(Number(value), 52));
    } else if (paymentInterval.value === "MONTH") {
      // Restrict input to numbers between 1 and 12
      restrictedValue = Math.max(1, Math.min(Number(value), 12));
    }
    setPaymentDuration(restrictedValue);
  };
  const handleDropDownChange = (option) => {
    if (option.value !== null) {
    }
    setPaymentPreference(option);
    setPaymentType(option.value);
  };
  const addNote = () => {
    globalState.products.set((prev) => {
      return prev.map((product) =>
        product.id === productState.id ? { ...product, note: note } : product
      );
    });
    onClose();
  };

  const handleAddPackage = (selectedPackage) => {
    packages
      ? setPackages([...packages, { ...selectedPackage, quantity: 1 }])
      : setPackages([{ ...selectedPackage, quantity: 1 }]);
    setAddPackages(!addPackages);
  };
  const handleRemovePackage = (removedPackage, index) => {
    const updatedPackages = packages.filter(
      (packagee, packageIndex) => index !== packageIndex
    );
    setPackages(updatedPackages);
  };

  const handleQuantityChange = (packagee, value) => {
    const updatedPackages = packages.map((thisPackage) => {
      if (thisPackage.id === packagee.id) {
        return { ...thisPackage, quantity: value };
      } else return thisPackage;
    });
    setPackages(updatedPackages);
  };
  return (
    <Box p={3}>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Note:</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="p4" fontWeight="400" mb="8px">
              Add note
            </Text>
            <Textarea
              h="350px"
              placeholder="Add notes"
              defaultValue={productState.note}
              size="lg"
              onChange={(e) => setNote(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button onClick={addNote}>Add</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Grid gridTemplateColumns={"1.3fr 0.7fr"} gap={4}>
        <GridItem w={"100%"}>
          <Card w="100%" className="sidebar-container-class">
            <CardHeader p={3}>
              <Flex justifyContent={"space-between"}>
                <Text as={"b"} fontSize={"h5"}>
                  Invoice Items
                </Text>
                <HStack spacing={"16px"}>
                  <LuPackagePlus
                    cursor={"pointer"}
                    onClick={() => {
                      setAddPackages(!addPackages);
                    }}
                    size={"25px"}
                  />
                  <Checkbox
                    onChange={(e) => setShowThumbnail(e.target.checked)}
                    defaultChecked={showThumbnail}
                  />
                  <Text fontSize="p5" fontWeight="500">
                    Show Thumbnail
                  </Text>
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody maxH="55vh" overflowY={"scroll"}>
              <SelectPackage
                presentationImages={presentationImages}
                addPackages={addPackages}
                setAddPackages={setAddPackages}
                handleAddPackage={handleAddPackage}
              />
              <VStack alignItems={"flex-start"} spacing={"16px"}>
                {packages && packages.length > 0 && (
                  <Table variant="simple" size="md" borderRadius={"4px"}>
                    <Thead bg={"#FCFCFA"}>
                      <Tr>
                        <Th fontSize="p6">NAME</Th>
                        <Th fontSize="p6">DESCRIPTION</Th>
                        <Th fontSize="p6">QUANTITY</Th>
                        <Th fontSize="p6">PRICE</Th>
                        <Th fontSize="p6">TOTAL</Th>
                        <Th fontSize="p6">ACTIONS</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {packages.map((packagee, index) => (
                        <Tr key={index}>
                          <Td fontSize="p6">{packagee.name}</Td>
                          <Td fontSize="p6" maxW="150px" isTruncated>
                            {packagee.description}
                          </Td>
                          <Td fontSize="p6">
                            <NumberInput
                              w={"70px"}
                              size="sm"
                              min={1}
                              value={packagee.quantity}
                              onChange={(e) => {
                                handleQuantityChange(packagee, Number(e));
                              }}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper
                                  children={<GrFormUp />}
                                />
                                <NumberDecrementStepper
                                  children={<GrFormDown />}
                                />
                              </NumberInputStepper>
                            </NumberInput>
                          </Td>
                          <Td fontSize="p6">{`$${packagee.price}`}</Td>
                          <Td fontSize="p6">{`$${
                            Number(packagee.price) * packagee.quantity
                          }`}</Td>
                          <Td fontSize="p6">
                            <Flex
                              gap={"16px"}
                              alignItems={"center"}
                              justifyContent={"center"}
                            >
                              <EditPackageModal
                                packagee={packagee}
                                presentationImages={presentationImages}
                                setPackages={setPackages}
                                packages={packages}
                              />
                              <MdCancel
                                onClick={() => {
                                  handleRemovePackage(packagee, index);
                                }}
                                size={"20px"}
                              />
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}

                {products && products.length > 0 ? (
                  <VStack w="100%" alignItems={"flex-start"}>
                    {products.map((product, index) => {
                      // Calculate the total price by adding the prices of matting, frame, and size
                      const totalPrice =
                        parseFloat(product.matting.price) +
                        parseFloat(product.frame.price) +
                        parseFloat(product.size.price);

                      return (
                        <InvoiceItemCard
                          productName={product.productDetails.title}
                          frame={product.frame.value}
                          matting={product.matting.value}
                          thumbnailCheck={showThumbnail}
                          size={product.size.value}
                          thumbnailImage={product.photo.thumbnailBase64}
                          note={product.note}
                          amount={totalPrice}
                          handleEditClick={() => {
                            setProductState(product), onOpen();
                          }}
                        />
                      );
                    })}
                  </VStack>
                ) : (
                  <Text>No products finalized.</Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
        <GridItem w={"100%"}>
          <Box>
            <Card py={2} px={4}>
              <CardHeader p={2}>
                <Flex>
                  <Text as={"b"} fontSize={"h5"}>
                    Payment plans & Retainers
                  </Text>
                </Flex>
              </CardHeader>
              {/* <Divider borderColor={"gray.400"} width={'100%'} /> */}
              <CardBody p={2}>
                <Flex mb="10px">
                  <SelectDropdown
                    containerHeight="55px"
                    labelSize="p5"
                    placeholder="Full Payment / Subscription Plan"
                    value={paymentPreference}
                    label="Full Payment / Suscription Plans :"
                    options={paymentPrefOption.map((ele) => ({
                      label: ele.name,
                      value: ele.value,
                    }))}
                    onChange={handleDropDownChange}
                  />
                </Flex>
                <HStack spacing={10} w="100%">
                  <LabeledInput
                    type="number"
                    label="Retainer Paid"
                    labelSize="p5"
                    name="retainer"
                    onChange={handlePriceChange}
                    value={additionalCost.retainer}
                    leftIcon={<IoIosCash />}
                  />
                  <LabeledInput
                    type="number"
                    label="Shipping"
                    labelSize="p5"
                    name="shipping"
                    onChange={handlePriceChange}
                    value={additionalCost.shipping}
                    leftIcon={<MdLocalShipping />}
                  />
                </HStack>

                {user!.organization!.discountCheck && (
                  <VStack w="100%">
                    <HStack width={"100%"} alignItems={"center"}>
                      <LabeledInput
                        type="number"
                        label="Flat Discount"
                        labelSize="p5"
                        name="flatDiscount"
                        isDisabled={additionalCost.percDiscount !== 0}
                        onChange={handlePriceChange}
                        value={additionalCost.flatDiscount}
                        leftIcon={<TbDiscountCheckFilled />}
                      />
                      <Text fontSize={"p5"}>OR</Text>
                      <LabeledInput
                        type="number"
                        label="Percentage Discount (%)"
                        labelSize="p5"
                        name="percDiscount"
                        isDisabled={additionalCost.flatDiscount !== 0}
                        onChange={(e) =>
                          setAdditionalCost((prevState) => ({
                            ...prevState,
                            [e.target.name]: Number(e.target.value),
                            percDiscAmount:
                              //without using currency.js
                              // subtotalCost * (Number(e.target.value) / 100),
                              currency(subtotalCost).multiply(
                                currency(e.target.value).divide(100).value
                              ).value,
                          }))
                        }
                        // onBlur={(e) => {
                        //   setTotalCost(
                        //     subtotalCost -
                        //       subtotalCost * (Number(e.target.value) / 100)
                        //   );
                        // }}
                        value={additionalCost.percDiscount}
                        leftIcon={<TbDiscount2 />}
                      />
                    </HStack>
                    {/* {user!.organization!.discountCodeCheck && (
                    <LabeledInput
                      type='text'
                      label='Discount Code'
                      placeholder='Enter discount code...'
                      labelSize='p5'
                      name='discountCode'
                      // isDisabled={additionalCost.flatDiscount !== 0}
                      // onChange={(e) =>
                      //   setAdditionalCost((prevState) => ({
                      //     ...prevState,
                      //     [e.target.name]: -Number(e.target.value),
                      //   }))
                      // }
                      // onBlur={handlePricePercentageChange}
                      // value={additionalCost.percDiscount}
                      leftIcon={<MdDiscount />}
                    />
                  )} */}
                  </VStack>
                )}
                <LabeledInput
                  type="number"
                  label="Tax (%)"
                  labelSize="p5"
                  loading={salesTaxLoading}
                  isReadOnly
                  name="tax"
                  // onChange={handlePriceChange}
                  value={additionalCost.tax}
                  leftIcon={<TbReceiptTax />}
                />
                {paymentPreference.value === "subscription" ? (
                  <>
                    <Divider borderColor={"gray.400"} py={2} />
                    <Box>
                      <Text fontSize={"p5"}>
                        Enter your prefered payment interval
                      </Text>
                      <Select
                        placeholder="Weekly/Monthly"
                        onChange={handlePaymentIntervalChange}
                        value={paymentInterval.value}
                        height={"40px"}
                      >
                        {paymentIntervalConst.map((option, index) => (
                          <option value={option.value} key={index}>
                            {option.title}
                          </option>
                        ))}
                      </Select>
                    </Box>
                    <LabeledInput
                      type="number"
                      label="Select your total payment duration"
                      labelSize="p5"
                      onChange={handlePaymentDuration}
                      isDisabled={
                        paymentInterval.value === "week" ||
                        paymentInterval.value === "month"
                          ? false
                          : true
                      }
                      // isDisabled={false}
                      value={paymentDuration}
                      name="paymentDuration"
                      placeholder={
                        paymentInterval.value === "week"
                          ? "1-52"
                          : paymentInterval.value === "month"
                          ? "1-12"
                          : "Nothing selected..."
                      }
                    />
                  </>
                ) : (
                  <></>
                )}
              </CardBody>
            </Card>

            <Box paddingTop={3}>
              <Card py={2} px={4}>
                <CardHeader p={2}>
                  <Flex>
                    <Text as={"b"} fontSize={"h5"}>
                      Order Summary
                    </Text>
                  </Flex>
                </CardHeader>
                <CardBody p={3}>
                  <Flex>
                    <Text as={"b"} fontSize={"h6"}>
                      Subtotal
                    </Text>
                    <Spacer />
                    <Text as={"b"} fontSize={"h6"}>
                      {formatCurrency.format(subtotalCost)}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text fontSize={"p5"}>Retainer</Text>
                    <Spacer />
                    <Text fontSize={"p5"}>
                      -{formatCurrency.format(additionalCost.retainer)}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text fontSize={"p5"}>Shipping</Text>
                    <Spacer />
                    <Text fontSize={"p5"}>
                      {formatCurrency.format(Math.abs(additionalCost.shipping))}
                    </Text>
                  </Flex>

                  <Flex>
                    <Text fontSize={"p5"}>Discount applied</Text>
                    <Spacer />
                    <Text fontSize={"p5"}>
                      {/* {formatCurrency.format(additionalCost.flatDiscount) ||
                      formatCurrency.format(additionalCost.percDiscAmount)} */}
                      {`${formatCurrency.format(
                        additionalCost.flatDiscount !== null &&
                          additionalCost.flatDiscount !== undefined &&
                          additionalCost.flatDiscount !== 0
                          ? -additionalCost.flatDiscount
                          : additionalCost.percDiscAmount !== null &&
                            additionalCost.percDiscAmount !== undefined &&
                            additionalCost.percDiscAmount !== 0
                          ? -additionalCost.percDiscAmount
                          : 0
                      )}`}
                    </Text>
                  </Flex>

                  <Flex>
                    <Text fontSize={"p5"}>Taxed amount</Text>
                    <Spacer />
                    <Text fontSize={"p5"}>
                      {formatCurrency.format(taxAmount)}
                    </Text>
                  </Flex>

                  <Divider borderColor={"gray.400"} />

                  <Flex>
                    <Text as={"b"} fontSize={"h5"}>
                      Total
                    </Text>
                    <Spacer />
                    <Text as={"b"} fontSize={"h5"}>
                      {formatCurrency.format(totalCost)}
                    </Text>
                  </Flex>
                  <Divider borderColor={"gray.400"} />

                  {paymentPreference.value === "subscription" ? (
                    <>
                      <Flex>
                        <Text fontSize={"p5"}>Prefered Interval</Text>
                        <Spacer />
                        {paymentInterval.title !== "" ? (
                          <Text fontSize={"p5"}>{paymentInterval.title}</Text>
                        ) : (
                          <Text as={"i"} fontSize={"p6"} textColor={"gray"}>
                            Please select a payment interval
                          </Text>
                        )}
                      </Flex>

                      <Flex>
                        <Text fontSize={"p5"}>Payment Cycles</Text>
                        <Spacer />
                        <Text fontSize={"p5"}>{paymentDuration}</Text>
                      </Flex>

                      <Flex>
                        <Text as={"b"} fontSize={"h6"}>
                          Amount charged per payment
                        </Text>
                        <Spacer />
                        <Text as={"b"} fontSize={"h6"}>
                          {/* {formatCurrency.format(totalCost / paymentDuration)} */}
                          {formatCurrency.format(
                            currency(totalCost).divide(paymentDuration).value
                          )}
                        </Text>
                      </Flex>
                    </>
                  ) : (
                    <></>
                  )}
                </CardBody>
              </Card>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

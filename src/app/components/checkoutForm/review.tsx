import React from "react";
import { useGlobalState } from "../../../state/store";

import {
  Box,
  Heading,
  Flex,
  VStack,
  Divider,
  Grid,
  GridItem,
  Text,
  CardHeader,
  Card,
  CardBody,
  Spacer,
  Textarea,
} from "@chakra-ui/react";

let formatCurrency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
});

export function Review(props: {
  shipDetails: {
    fName: string;
    lName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region?: string;
    zipCode: string;
    country: string;
  };
  paymentDetails?: {
    cardName: string;
    cardNumber: string;
    expDate: string;
    cvv: string;
    remDetailsCheck?: boolean;
  };
}) {
  const wrappedState = useGlobalState();
  const products = wrappedState.getAllProducts();
  return (
    <VStack spacing={2} padding={2}>
      <Box width='100%'>
        <Heading as='h4' size='md' my='10px'>
          Order Summary
        </Heading>

        <Grid
          templateAreas={`"shipping payment terms costBreakDown"`}
          gridTemplateColumns={"1fr 1fr 1fr 1fr"}
          h='100%'
        >
          <GridItem p={1} area={"shipping"}>
            <Heading as='h6' size='sm'>
              Shippping
            </Heading>
            <Text>
              Name: {props.shipDetails.fName} {props.shipDetails.lName}
            </Text>
            <Text>
              Address: {props.shipDetails.addressLine1}{" "}
              {props.shipDetails.addressLine2}
            </Text>
            <Text>City: {props.shipDetails.city}</Text>
            <Text>State: {props.shipDetails.region}</Text>
            <Text>ZIP Code: {props.shipDetails.zipCode}</Text>
            <Text>Country: {props.shipDetails.country}</Text>
          </GridItem>
          <GridItem p={1} area={"payment"}>
            <Heading as='h6' size='sm'>
              Payment details
            </Heading>
            <Text>Card type: Visa</Text>
          </GridItem>
          {/* <GridItem p={1} area={"terms"}>
            <Heading as='h6' size='sm'>
              Terms & Conditions
            </Heading>
          </GridItem> */}
          <GridItem p={1} area={"costBreakDown"}>
            <Heading as='h6' size='sm'>
              Product Details
            </Heading>
            {products && products.length > 0 ? (
              <VStack width={"100%"} mt='10px'>
                {products
                  .filter((p) => p.rating === 3)
                  .map((product, index) => {
                    const totalAmount = Object.values(
                      product.productOptionsPrices
                    ).reduce((acc, price) => acc + price, 0);

                    return (
                      <Card key={index} py={2} px={4} width={"100%"}>
                        <CardHeader p={3} fontSize={"h7"} fontWeight='semibold'>
                          {product.productTitle}
                        </CardHeader>
                        <Divider borderColor={"gray.400"} />
                        <CardBody p={3}>
                          <Flex>
                            <Text fontWeight='semibold'>Total Amount:</Text>
                            <Spacer />
                            <Text as='b'>
                              {formatCurrency.format(totalAmount)}
                            </Text>
                          </Flex>
                        </CardBody>
                      </Card>
                    );
                  })}
              </VStack>
            ) : (
              <Text>No products finalized.</Text>
            )}
          </GridItem>
        </Grid>
      </Box>
      <Text fontSize='p5' fontWeight='semibold'>
        Add Note
      </Text>
      <Textarea
        placeholder='Add your note here...'
        w='500px'
        // value={userNote}
        // onChange={handleNoteChange}
      />
    </VStack>
  );
}

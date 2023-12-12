import React from "react";

import {
  Box,
  Center,
  Grid,
  Text,
  GridItem,
  Heading,
  Link,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { CheckoutStepper } from "./checkoutStepper";

export function Checkout(props: { user; client }) {
  const { user, client } = props;

  return (
    <Box className='hide-scrollbar' h='100%'>
      <Grid
        templateAreas={`
                  "form"
                  "information"`}
        gridTemplateRows={"1fr 30px"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem p={1} area={"form"}>
          <Center marginTop='30px'>
            <Box
              p={3}
              width='98%'
              border='solid 1px gray'
              borderRadius={"4px"}
              bg={"whiteAlpha.500"}
            >
              <Heading as='h4' size='md' textAlign='center' mb='8px'>
                Checkout
              </Heading>
              <CheckoutStepper client={client} />
            </Box>
          </Center>
        </GridItem>
        <GridItem p={1} area={"information"}>
          <Divider />
          <Center height='100%'>
            <Text as='i' color='gray.400' textAlign='center'>
              Copyright ©{" "}
              <Link color='inherit' href='#'>
                MyStudioPro
              </Link>{" "}
              {new Date().getFullYear()}.
            </Text>
          </Center>
        </GridItem>
      </Grid>
    </Box>
  );
}

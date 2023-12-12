import React from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  Text,
  VStack,
  Flex,
  TableContainer,
  Table,
  Tbody,
  Tr,
  Td,
  Divider,
  Input,
  SkeletonText,
  Center,
} from "@chakra-ui/react";
import { InvoicePdf } from "./invoicePdf";
export const Invoice = (props) => {
  const mainCardStyle = {
    padding: "0",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };

  return (
    <>
      {props.loading ? (
        <Box
          padding='6'
          boxShadow='lg'
          bg='greys.400'
          width='100%'
          minH='255px'
          maxH='255px'
          mt='20px'
          borderRadius='4px'
        >
          <SkeletonText mt='4' noOfLines={5} spacing='4' skeletonHeight='5' />
        </Box>
      ) : props.invoice?.length > 0 ? (
        <>
          <Card variant='outline' style={mainCardStyle}>
            <CardBody padding='16px'>
              <Flex justifyContent='space-between'>
                <Box>
                  <VStack>
                    <Text fontSize='h5' fontWeight='600'>
                      Invoice # {props.invoiceNumber}
                    </Text>
                    <Text w='100%' fontSize='h7' fontWeight='600'>
                      mystudiopro
                    </Text>
                  </VStack>
                </Box>
                <InvoicePdf data={props} />
              </Flex>
            </CardBody>
          </Card>

          <Card variant='outline' style={mainCardStyle}>
            <CardBody padding='16px'>
              <Box>
                <Text fontSize='h6' fontWeight='600'>
                  Info
                </Text>
                <TableContainer>
                  <Table
                    variant='unstyled'
                    size='sm'
                    style={{
                      borderCollapse: "separate",
                      borderSpacing: "0 1em",
                    }}
                  >
                    <Tbody>
                      <Tr>
                        <Td fontSize='h7' fontWeight='600'>
                          Client
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.clientName}
                        </Td>
                        <Td fontSize='h7' fontWeight='600'>
                          Status
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.status}
                        </Td>
                        <Td fontSize='h7' fontWeight='600'>
                          Issue Date
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.issueDate}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontSize='h7' fontWeight='600'>
                          Contact
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.clientEmail}
                        </Td>
                        <Td fontSize='h7' fontWeight='600'>
                          Balance Due
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.balanceDue}
                        </Td>
                        <Td fontSize='h7' fontWeight='600'>
                          Due Date
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.dueDate}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Box mt='30px'>
                            <Text fontSize='h6' fontWeight='600'>
                              Order
                            </Text>
                          </Box>
                        </Td>
                      </Tr>

                      <Tr>
                        <Td fontSize='h7' fontWeight='600'>
                          Items
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.items}
                        </Td>
                        <Td fontSize='h7' fontWeight='600'>
                          Discounts
                        </Td>
                        <Td>
                          <HStack>
                            <Text>Percentage</Text>
                            <Input
                              htmlSize={1}
                              width='60px'
                              height='30px'
                              placeholder='0%'
                              defaultValue={props.discountPercentage}
                            />
                            <Text>Absolute</Text>
                            <Input
                              htmlSize={1}
                              width='60px'
                              height='30px'
                              placeholder='300'
                              defaultValue={props.absoluteDiscountValue}
                            />
                          </HStack>
                        </Td>
                        <Td fontSize='h7' fontWeight='600'>
                          Sales Tax
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.salesTax}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontSize='h7' fontWeight='600'>
                          Subtotal
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.subtotal}
                        </Td>
                        {/* <Td fontSize='h7' fontWeight='600'>
                          Amount
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.amount}
                        </Td> */}
                        <Td fontSize='h7' fontWeight='600'>
                          Shippping
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.shipping}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>
                          <Box mt='35px' />
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontSize='h7' fontWeight='600'>
                          Total
                        </Td>
                        <Td fontSize='p5' fontWeight='400'>
                          {props.total}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontSize='h7' fontWeight='600'>
                          Amount Paid
                        </Td>
                        <Td fontSize='p5' fontWeight='400' color='#55AB68'>
                          {props.amountPaid}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td fontSize='h7' fontWeight='600'>
                          Balance Due
                        </Td>
                        <Td fontSize='p5' fontWeight='400' color='#DA615C'>
                          {props.totalBalanceDue}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
                <Divider />
              </Box>
            </CardBody>
          </Card>
        </>
      ) : (
        <Center>
          <Text fontSize='p3' fontWeight='semi-bold'>
            No Invoice To Show
          </Text>
        </Center>
      )}
    </>
  );
};

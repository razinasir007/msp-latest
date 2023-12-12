import React from "react";
import {
  Card,
  CardBody,
  Flex,
  HStack,
  Image,
  Text,
  Box,
  VStack,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from "@chakra-ui/react";

export const InvoiceItemCard = (props: {
  thumbnailImage;
  productName;
  handleEditClick();
  size;
  thumbnailCheck;
  note;
  frame;
  amount;
  matting;
}) => {
  return (
    <>
      <Card width={"100%"} bgColor='#FCFCFA'>
        <CardBody>
          <HStack>
            {props.thumbnailCheck && (
              <Image src={props.thumbnailImage} height='150px' maxW='150px' />
            )}
            <Box>
              <TableContainer>
                <Table
                  variant='unstyled'
                  size='sm'
                  style={{
                    borderCollapse: "separate",
                  }}
                >
                  {" "}
                  <Thead>
                    <Tr>
                      <Th fontSize='16px'>{props.productName}</Th>
                    </Tr>
                  </Thead>
                  <Thead>
                    <Tr>
                      <Th>Type</Th>
                      <Th>Size</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>Canvas</Td>
                      <Td>{props.size}</Td>
                    </Tr>
                  </Tbody>
                  <Thead>
                    <Tr>
                      <Th>Frame</Th>
                      <Th>Thickness</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>{props.frame}</Td>
                      <Td>1 "in</Td>
                    </Tr>
                  </Tbody>
                  <Thead>
                    <Tr>
                      <Th>Matting</Th>
                      <Th>Note</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>{props.matting}</Td>
                      <Td>
                        {props.note === undefined
                          ? "No Note Available"
                          : props.note}
                      </Td>
                    </Tr>
                  </Tbody>
                  <Flex>
                    <Text
                      marginLeft='10px'
                      fontSize='14px'
                      fontWeight='semibold'
                    >
                      PRICE: ${`${props.amount} USD`}
                    </Text>
                  </Flex>
                  <Flex mt='10px'>
                    <Text
                      marginLeft='10px'
                      cursor='pointer'
                      fontSize='13px'
                      color='#1599e6'
                      onClick={() => props.handleEditClick()}
                    >
                      Add Note
                    </Text>
                  </Flex>
                </Table>
              </TableContainer>
            </Box>
          </HStack>
        </CardBody>
      </Card>
    </>
  );
};

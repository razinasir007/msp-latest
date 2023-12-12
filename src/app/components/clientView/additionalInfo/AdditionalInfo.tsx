import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Card,
  CardBody,
  Text,
  Box,
  TableContainer,
  Table,
  Tbody,
  Td,
  Tr,
  SkeletonText,
  Center,
  CardHeader,
  Divider,
  Image,
} from "@chakra-ui/react";
import { GetClient } from "../../../../apollo/clientQueries";
import { GetClientAdditionalInfo } from "../../../../apollo/formsQueries";

const mainCardStyle = {
  padding: "0",
  width: "100%",
  borderRadius: "4px",
  borderColor: "greys.300",
};

export const AdditionalInfo = (props: { clientID?: string }) => {
  const [additionalInfo, setAdditionalInfo] = useState([]);
  // const {
  //   loading: clientDataLoading,
  //   error: clientDataError,
  //   data: ClientData,
  // } = useQuery(GetClient, {
  //   variables: { userId: props.clientID },
  // });

  const {
    loading: clientDataLoading,
    error: clientDataError,
    data: ClientData,
  } = useQuery(GetClientAdditionalInfo, {
    variables: { clientId: props.clientID, formType: "INTAKE_FORM" },
  });

  useEffect(() => {
    if (ClientData?.organizationFormsFilled.lookupByTypeAndClient) {
      // console.log(
      //   ClientData?.organizationFormsFilled?.lookupByTypeAndClient[0]?.values
      //     ?.data
      // );
      const updatedAdditionInfo =
        ClientData?.organizationFormsFilled?.lookupByTypeAndClient[0]?.values?.data.map(
          (info) => {
            return {
              name: info.name,
              value: info.value,
              datatype: info.dataType,
            };
          }
        );
      setAdditionalInfo(updatedAdditionInfo);
    }
  }, [ClientData]);

  return (
    <>
      <Card variant='outline' style={mainCardStyle}>
        <CardHeader padding='16px'>
          <Text fontSize='h5' fontWeight='600'>
            Additional Info
          </Text>
        </CardHeader>
        <Divider w='100%' opacity={1} />
        <CardBody padding='16px'>
          {clientDataLoading ? (
            <Box
              padding='6'
              boxShadow='lg'
              bg='greys.400'
              width='100%'
              minH='235px'
              maxH='235px'
              mt='20px'
              borderRadius='4px'
            >
              <SkeletonText
                mt='4'
                noOfLines={5}
                spacing='4'
                skeletonHeight='5'
              />
            </Box>
          ) : (
            <Box>
              <TableContainer>
                <Table
                  variant='unstyled'
                  size='sm'
                  style={{ borderCollapse: "separate", borderSpacing: "1em" }}
                >
                  <Tbody>
                    {!clientDataError && additionalInfo.length > 0 ? (
                      additionalInfo.map(
                        (ele, index) =>
                          ele.datatype !== "SIGNATURE" && (
                            <Tr key={index}>
                              <Td fontSize='h6' fontWeight='600'>
                                {ele.name}
                              </Td>
                              <Td fontSize='p4' fontWeight='400'>
                                {ele.datatype === "LIST"
                                  ? ele.value.map((option, i) => (
                                      <React.Fragment key={i}>
                                        {i !== ele.value.length - 1
                                          ? `${option}, `
                                          : option}
                                      </React.Fragment>
                                    ))
                                  : ele.value}
                              </Td>
                            </Tr>
                          )
                      )
                    ) : (
                      <Center minH='300px' flexDirection='column'>
                        <Text fontSize='p5' fontWeight='semibold'>
                          No additional info availabe to for this client
                        </Text>
                      </Center>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </CardBody>
      </Card>
    </>
  );
};

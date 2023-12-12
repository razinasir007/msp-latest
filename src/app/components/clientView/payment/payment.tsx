import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Flex,
  VStack,
  Text,
  SkeletonText,
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { BsThreeDots } from "react-icons/bs";
import { AddPayment } from "./addPayment";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { CLIENT_ROLE } from "../../../../constants";

export const Payment = (props) => {
  const user = useHookstate(globalState.user);
  const mainCardStyle = {
    padding: "0",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const containerStyle = useMemo(
    () => ({ width: "100%", height: "300px" }),
    []
  );
  const [rowData] = useState([
    {
      item: "Retainer",
      status: "Paid",
      paymentDate: "Feb 24, 2023",
      amountPaid: "$300.00",
      amountRemaining: "-",
      type: "Cash",
    },
    {
      item: "Payment 1",
      status: "Unpaid",
      paymentDate: "-",
      amountPaid: "-",
      amountRemaining: "$356.00",
      type: "-",
    },
    {
      item: "Payment 1",
      status: "Unpaid",
      paymentDate: "-",
      amountPaid: "-",
      amountRemaining: "$356.00",
      type: "-",
    },
  ]);
  const columnDefs: ColDef[] = [
    {
      field: "orderId",
      headerName: "Order Id",
      maxWidth: 200,
      filter: true,
    },
    {
      field: "status",
      headerName: "Status",
      maxWidth: 170,
      unSortIcon: true,
    },

    {
      field: "paymentDate",
      headerName: "Payment Date",
      maxWidth: 200,
      editable: false,
      unSortIcon: true,
    },
    {
      field: "amountPaid",
      headerName: "Amount Paid",
      maxWidth: 200,
      editable: false,
      unSortIcon: true,
    },
    {
      headerName: "",
      field: "action",
      maxWidth: 100,
      cellRendererFramework: (params) => (
        <div style={{ marginTop: 7 }}>
          <BsThreeDots size={23} style={{ cursor: "pointer" }} />
        </div>
      ),
    },
  ];
  return (
    <>
      <Card variant='outline' style={mainCardStyle}>
        <CardBody padding='16px'>
          <Flex justifyContent='space-between'>
            <Text fontSize='h5' fontWeight='600'>
              Payment
            </Text>
            {user.get()?.role?.name === CLIENT_ROLE.name ? null : (
              <AddPayment clientId={props.clientId} orderId={props.orderId} />
            )}
          </Flex>
        </CardBody>
      </Card>
      <Card variant='outline' style={mainCardStyle}>
        <CardBody padding='16px'>
          <VStack spacing='20px' mt='20px' width='100%'>
            {props.paymentLoading ? (
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
              <>
                <Box style={containerStyle}>
                  <Box style={gridStyle} className='ag-theme-material'>
                    <AgGridReact
                      rowData={props.rowData}
                      columnDefs={columnDefs}
                    />
                  </Box>
                </Box>
              </>
            )}
          </VStack>
        </CardBody>
      </Card>
    </>
  );
};

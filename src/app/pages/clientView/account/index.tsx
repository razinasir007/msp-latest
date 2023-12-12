import React, { useContext, useEffect, useMemo, useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  SkeletonCircle,
  SkeletonText,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ColDef } from "ag-grid-community";
import { AiFillEye } from "react-icons/ai";
import { AgGridReact } from "ag-grid-react";
import { AdditionalInfo } from "../../../components/clientView/additionalInfo/AdditionalInfo";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GetClientOrder } from "../../../../apollo/clientQueries";
import moment from "moment";
import { GetOrdersData } from "../../../components/interfaces";
import { v4 as uuidv4 } from "uuid";
import { globalState, useGlobalState } from "../../../../state/store";
import { ChangePaymentMethodModal } from "../../../components/paymentMethod/changePaymentMethodModal";
import { ChangePaymentMethod } from "../../../../apollo/paymentQueries";
import { useHookstate } from "@hookstate/core";
import { CLIENT_ROLE, ROUTE_PATHS } from "../../../../constants";
import { OrderStageEnum } from "../../../../apollo/gql-types/graphql";
import { UserRolesEnum } from "../../../../constants/enums";
import { UserPermissions } from "../../../routes/permissionGuard";
import Swal from "sweetalert2";
export const ClientViewAccount = (props: { client }) => {
  const navigate = useNavigate();
  const { userPermissions } = useContext(UserPermissions);
  const user = useHookstate(globalState.user);
  const state = useGlobalState();
  const [ordersData, setOrdersData] = useState<GetOrdersData[]>([]);
  const [clientSecretPaymentMethod, setClientSecretPaymentMethod] =
    useState("");
  const [paymentKey, setPaymentKey] = useState("");
  const mainCardStyle = {
    padding: "0",
    width: "100%",
    borderRadius: "4px",
    borderColor: "greys.300",
  };
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const containerStyle = useMemo(
    () => ({ width: "100%", height: "210px" }),
    []
  );
  const [
    GetChangePaymentMethodSecret,
    {
      loading: GetChangePaymentMethodSecretLoading,
      error: GetChangePaymentMethodSecretError,
      data: GetChangePaymentMethodSecretData,
    },
  ] = useMutation(ChangePaymentMethod, {});
  const {
    loading: clientorderLoading,
    error: clientOrderError,
    data: ClientOrderData,
  } = useQuery(GetClientOrder, {
    variables: { userId: props.client?.id },
  });

  useEffect(() => {
    if (ClientOrderData) {
      if (user.get()?.role?.name !== CLIENT_ROLE.name) {
        const formattedData = ClientOrderData.clients.lookupClient.orders
          .filter((ele) => {
            return ele.orgId === user.get()?.organization?.id;
          })
          .map((ele) => ({
            id: ele.id,
            numberOfProducts: ele.numberOfProducts,
            dueDate: moment(ele.dueDate).format("MMMM Do YYYY"),
            stage: ele.stage,
            orgName: ele.org.name,
          }));
        setOrdersData(formattedData);
      } else {
        const formattedData = ClientOrderData.clients.lookupClient.orders.map(
          (ele) => ({
            orgName: ele.org.name,
            id: ele.id,
            numberOfProducts: ele.numberOfProducts,
            dueDate: moment(ele.dueDate).format("MMMM Do YYYY"),
            stage: ele.stage,
          })
        );
        setOrdersData(formattedData);
      }
    }
  }, [ClientOrderData]);

  const handleEyeClick = (order) => {
    navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.CLIENT_VIEW_ORDER}`, {
      state: { clientId: props.client?.id, order: order.data.id },
    });
  };
  const draftOrderClick = (order) => {
    localStorage.setItem("OrderId", order.id);
    state.deleteAllImages();
    state.removeAllProducts();
    navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.TOOL}`, {
      state: { client: props.client, order: order },
    });

    // localStorage.setItem("DraftOrder", JSON.stringify(order));
  };
  const createOrderClick = () => {
    const orderId: string = uuidv4();
    localStorage.setItem("OrderId", orderId);
    state.deleteAllImages();
    state.removeAllProducts();
    navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.TOOL}`, {
      state: { client: props.client },
    });
  };
  const columnDefs: ColDef[] = [
    {
      field: "orgName",
      headerName: "Studio Name",
      maxWidth: 160,
      filter: true,
    },
    {
      field: "id",
      headerName: "Order ID",
      maxWidth: 170,
      filter: true,
    },
    {
      field: "stage",
      headerName: "Stage",
      maxWidth: 120,
      filter: true,
      cellRendererFramework: (params: { data: { stage: string } }) => (
        <div>
          <span
            style={{
              backgroundColor:
                params.data.stage === OrderStageEnum.Open ||
                params.data.stage === OrderStageEnum.Completed
                  ? "#C6F6D5"
                  : "#FEEBCB",
              width: "70px",
              height: "20px",
              borderRadius: "2px",
              justifyContent: "center",
            }}
          >
            {params.data.stage}
          </span>
        </div>
      ),
    },

    {
      field: "numberOfProducts",
      headerName: "Items",
      maxWidth: 90,
      editable: false,
      unSortIcon: true,
    },
    {
      field: "dueDate",
      headerName: "Delivery Date",
      maxWidth: 195,
      editable: false,
      unSortIcon: true,
    },

    {
      headerName: "Action",
      field: "action",
      width: 230,
      cellRendererFramework: (params) => (
        <Flex mt='10px'>
          {params.data.stage === OrderStageEnum.Draft ? (
            <Button
              size='xs'
              onClick={() => {
                if (userPermissions.fullAccess || userPermissions.edit) {
                  draftOrderClick(params.data);
                } else
                  Swal.fire({
                    icon: "error",
                    title: "Not Allowed",
                    text: "You are not allowed to make changes to this page",
                  });
              }}
              isDisabled={user.get()?.role?.name === CLIENT_ROLE.name}
            >
              Complete order
            </Button>
          ) : (
            <AiFillEye
              size={23}
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (userPermissions.fullAccess || userPermissions.view) {
                  handleEyeClick(params);
                } else
                  Swal.fire({
                    icon: "error",
                    title: "Not Allowed",
                    text: "You are not allowed to make changes to this page",
                  });
              }}
            />
          )}
        </Flex>
      ),
    },
  ];
  const handlePaymentMethodChange = () => {
    GetChangePaymentMethodSecret({
      variables: {
        change: {
          id: props.client?.id,
          stakeholder: UserRolesEnum.CLIENT,
          createdBy: user!.value?.uid,
        },
      },
      onCompleted: (res) => {
        if (
          res.payments &&
          res.payments.changePaymentMethod &&
          res.payments.changePaymentMethod.client_secret
        ) {
          setClientSecretPaymentMethod(
            res.payments.changePaymentMethod.client_secret
          );
          setPaymentKey(res.payments.changePaymentMethod.payment_key);
        }
      },
    });
  };
  return (
    <>
      <Grid
        templateAreas={`"header"
              "content"
              "footer"`}
        gridTemplateRows={"35px 1fr 61px"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <VStack spacing='10px'>
            <Text w='100%' fontSize='h2' fontWeight='600' lineHeight='35px'>
              Account
            </Text>
          </VStack>
        </GridItem>
      </Grid>
      <GridItem px='24px' area={"content"}>
        <Card variant='outline' style={mainCardStyle}>
          <CardHeader padding='16px'>
            <Flex justifyContent='space-between'>
              <Text fontSize='h5' fontWeight='600'>
                Orders
              </Text>
              {user.get()?.role?.name === CLIENT_ROLE.name ? null : (
                <HStack>
                  <ChangePaymentMethodModal
                    paymentKeyClient={paymentKey}
                    handleMethodChange={handlePaymentMethodChange}
                    loading={GetChangePaymentMethodSecretLoading}
                    clientSecret={clientSecretPaymentMethod}
                  />
                  <Button
                    variant='outline'
                    size='sm'
                    leftIcon={<AddIcon />}
                    onClick={createOrderClick}
                    isDisabled={
                      userPermissions.fullAccess || userPermissions.create
                        ? false
                        : true
                    }
                  >
                    Create a new order
                  </Button>
                </HStack>
              )}
            </Flex>
          </CardHeader>
          <Divider opacity={1} w='100%' />
          <CardBody padding='16px'>
            <VStack spacing='20px' mt='20px' width='100%'>
              {clientorderLoading ? (
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
                  <SkeletonCircle
                    size='10'
                    startColor='greys.200'
                    endColor='greys.600'
                  />
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
                        rowData={ordersData}
                        columnDefs={columnDefs}
                      ></AgGridReact>
                    </Box>
                  </Box>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
        {user.get()?.role?.name === CLIENT_ROLE.name ? null : (
          <Box mt='20px'>
            <AdditionalInfo clientID={props.client.id} />
          </Box>
        )}
      </GridItem>
    </>
  );
};

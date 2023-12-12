import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Flex,
  Grid,
  IconButton,
  GridItem,
  HStack,
  Spacer,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  Skeleton,
  Center,
} from "@chakra-ui/react";
import { MdViewStream, MdViewWeek } from "react-icons/md";
import { BsCartXFill } from "react-icons/bs";
import ProductionKanBanView from "./productionKanBanView";
import { ProductionGridView } from "./productionGridView";
import { State, useHookstate } from "@hookstate/core";
import { Order } from "../../../state/interfaces";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiRefreshCw } from "react-icons/fi";
import { useLazyQuery, useQuery } from "@apollo/client";
import {
  GetOrdersByLocId,
  GetOrdersByOrganizationIdNew,
} from "../../../apollo/orderQueries";
import Swal from "sweetalert2";
import { GetOrgLocs } from "../../../apollo/organizationQueries";
import { SelectDropdown } from "../../components/shared/selectDropdown";
import { globalState } from "../../../state/store";
import { UserPermissions } from "../../routes/permissionGuard";

export default function ProductionPage() {
  // console.log("production page access", props)
  const { userPermissions } = useContext(UserPermissions);

  // SETTING AND GETTING ORDERS USING GLOBAL STATE
  const orders: State<Order[]> = useHookstate([] as Order[]);
  // STATE TO CONTROL VIEW (TRUE=KAN BAN BOARD | FALSE=AG GRID)
  const [verticalView, setVerticalView] = useState(true);
  // STATE TO CONTROL SORT BY
  const [sortByDueDate, setSortByDueDate] = useState("dueDate");
  //QUERY CALL TO GET ORDERS BASED ON LOCATION OF AN ORGNAIZATIONS BRANCH
  const user = useHookstate(globalState.user);
  //state to check if the orders are required from the complete org or just a location
  const [ordersByOrgId, setOrdersByOrgId] = useState(true);

  //Get orders of a specific location of the organization
  const [
    getOrdersByLocation,
    {
      loading: ordersLoading,
      error: ordersError,
      data: ordersData,
      refetch: loadOrdersByLocation,
    },
  ] = useLazyQuery(GetOrdersByLocId);

  //Get orders of the complete organization
  const [
    getOrdersByOrgId,
    {
      loading: orgOrdersLoading,
      error: orgOrdersError,
      data: orgOrdersData,
      refetch: loadOrdersByOrg,
    },
  ] = useLazyQuery(GetOrdersByOrganizationIdNew);

  //For Getting Locations of the Current Organization
  const {
    loading: locationLoading,
    error: locationError,
    data: locationData,
  } = useQuery(GetOrgLocs, {
    variables: { orgId: user!.value!.organization?.id },
  });

  //UseEffect for getting orders of the complete organization
  useEffect(() => {
    getOrdersByOrgId({
      // variables: { orgId: user!.value!.organization?.id },
      variables: { orgId: user.value?.organization.id },
    });
  }, []);

  //UseEffect for getting the data on the basis of selected Location || complete organization
  useEffect(() => {
    //if orders for a specific location are required
    if (!ordersByOrgId) {
      if (ordersData?.orders.lookupByLocation) {
        //sort data according to due date initially
        const newArrayForDueDate = [];
        const newArrayForCreatedDate = [];
        ordersData.orders.lookupByLocation.map((item: any) => {
          if (item.dueDate === null) {
            newArrayForCreatedDate.push(item);
          } else {
            newArrayForDueDate.push(item);
          }
        });
        const sortedDataOfDueDate = newArrayForDueDate.sort(
          (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
        );
        const sortedDataOfCreatedAt = newArrayForCreatedDate.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        const finalSortedArray = sortedDataOfDueDate.concat(
          sortedDataOfCreatedAt
        );
        orders.set(finalSortedArray);
      }
      //if orders for a complete organization are required
    } else if (ordersByOrgId) {
      if (orgOrdersData?.orders.lookupByOrganizationNew) {
        //sort data according to due date initially
        const newArrayForDueDate = [];
        const newArrayForCreatedDate = [];
        orgOrdersData.orders.lookupByOrganizationNew.map((item: any) => {
          if (item.dueDate === null) {
            newArrayForCreatedDate.push(item);
          } else {
            newArrayForDueDate.push(item);
          }
        });
        const sortedDataOfDueDate = newArrayForDueDate.sort(
          (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
        );
        const sortedDataOfCreatedAt = newArrayForCreatedDate.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );

        const finalSortedArray = sortedDataOfDueDate.concat(
          sortedDataOfCreatedAt
        );
        orders.set(finalSortedArray);
      }
    }
  }, [ordersData, orgOrdersData]);

  const handleDropDownChange = (options) => {
    //empty the state first
    orders.set([]);
    //if value is "all" orders for complete organization query will be called
    if (options.value === "all") {
      setOrdersByOrgId(true);
      getOrdersByOrgId({
        variables: { orgId: user!.value!.organization?.id },
      });
    }
    //else orders for specific location query will be called
    else {
      setOrdersByOrgId(false);
      getOrdersByLocation({
        variables: { locId: options.value },
      });
    }
  };

  //handle manual refetch button
  const handleRefetch = () => {
    if (ordersByOrgId) {
      loadOrdersByOrg().then((response) => {
        if (response.data) {
          Swal.fire({
            icon: "success",
            title: "Re-fetched",
            text: "Re-fetched successfully",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        }
      });
    } else if (!ordersByOrgId) {
      loadOrdersByLocation().then((response) => {
        if (response.data) {
          Swal.fire({
            icon: "success",
            title: "Re-fetched",
            text: "Re-fetched successfully",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        }
      });
    }
  };

  return (
    <Box height='100vh'>
      <Grid
        templateAreas={`"header"
                    "content"
                    "footer"`}
        gridTemplateRows={"75px 1fr"}
        gridTemplateColumns={"1fr"}
        h='100%'
      >
        <GridItem padding={"24px 24px 16px"} area={"header"}>
          <Flex>
            <Text fontSize='h2' fontWeight='semibold' lineHeight='35px'>
              Production
            </Text>
            <Spacer />
            <Box width='300px'>
              <SelectDropdown
                containerHeight='55px'
                loading={locationLoading}
                placeholder=' Select Location'
                defaultValue={{
                  label: "All",
                  value: "all",
                }}
                options={[
                  ...(locationData?.organizations?.lookup.locations || []).map(
                    (ele) => ({
                      label: ele.address,
                      value: ele.id,
                    })
                  ),
                  {
                    label: "All",
                    value: "all",
                  },
                ]}
                onChange={handleDropDownChange}
              />
            </Box>
            <Spacer />
            <HStack spacing='32px' mb={9}>
              <Box>
                {verticalView && (
                  <Menu>
                    <MenuButton
                      as={Button}
                      variant='outline'
                      borderColor='black'
                      rightIcon={<ChevronDownIcon color='black' />}
                    >
                      <Text color='black'>Sort By</Text>
                    </MenuButton>
                    <MenuList>
                      <MenuOptionGroup
                        type='radio'
                        defaultValue='SortByDueDate'
                      >
                        <MenuItemOption
                          value='SortByDueDate'
                          _hover={{
                            background: "black",
                            color: "white",
                          }}
                          onClick={() => {
                            setSortByDueDate("dueDate");
                          }}
                        >
                          Sort By Due Date
                        </MenuItemOption>
                        <MenuItemOption
                          value='SortByCreatedAt'
                          _hover={{ color: "white", background: "black" }}
                          onClick={() => {
                            setSortByDueDate("createdAt");
                          }}
                        >
                          Sort By Created At
                        </MenuItemOption>
                      </MenuOptionGroup>
                    </MenuList>
                  </Menu>
                )}
                <IconButton
                  variant={"solid"}
                  marginLeft='8px'
                  aria-label='Vertical View'
                  sx={{
                    ":hover": {
                      backgroundColor: "#EAE8E9",
                    },
                  }}
                  icon={<FiRefreshCw size={20} />}
                  onClick={() => {
                    handleRefetch();
                  }}
                />
              </Box>
              <Box>
                <IconButton
                  variant={verticalView ? "solid" : "ghost"}
                  aria-label='Vertical View'
                  sx={{
                    ":hover": {
                      backgroundColor: "#EAE8E9",
                    },
                  }}
                  icon={<MdViewWeek size={20} />}
                  onClick={() => setVerticalView(true)}
                />
                <IconButton
                  marginLeft='8px'
                  variant={verticalView ? "ghost" : "solid"}
                  aria-label='Vertical View'
                  sx={{
                    ":hover": {
                      backgroundColor: "#EAE8E9",
                    },
                  }}
                  icon={<MdViewStream size={20} />}
                  onClick={() => setVerticalView(false)}
                />
              </Box>
            </HStack>
          </Flex>
        </GridItem>
        <GridItem px='24px' paddingBottom='16px' area={"content"}>
          {ordersLoading || orgOrdersLoading ? (
            <HStack width='100%' height='100%' spacing={3}>
              <Skeleton height='100%' width='25%' borderRadius='4px'></Skeleton>
              <Skeleton height='100%' width='25%' borderRadius='4px'></Skeleton>
              <Skeleton height='100%' width='25%' borderRadius='4px'></Skeleton>
              <Skeleton height='100%' width='25%' borderRadius='4px'></Skeleton>
            </HStack>
          ) : orders.length > 0 ? (
            verticalView ? (
              <ProductionKanBanView
                loading={ordersLoading}
                orders={orders}
                sortByDueDate={sortByDueDate}
              />
            ) : (
              <ProductionGridView orders={orders} />
            )
          ) : (
            <Center
              // minH='235px'
              height='100%'
              flexDirection='column'
              borderRadius='4px'
              border={"1px dashed #8A8A8A"}
              width='100%'
            >
              <BsCartXFill size={"40px"} />
              <Text fontSize='h6' fontWeight='semibold' mt='16px'>
                No orders yet...
              </Text>
            </Center>
          )}
        </GridItem>
        <GridItem padding={"16px 24px"} area={"footer"} bg='transparent'>
          <Flex justifyContent='end'></Flex>
        </GridItem>
      </Grid>
    </Box>
  );
}

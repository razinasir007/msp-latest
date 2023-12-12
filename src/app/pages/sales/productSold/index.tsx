import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  SkeletonText,
  Spacer,
  Tab,
  TabList,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import Chart from "react-apexcharts";
import { FaArrowCircleUp } from "react-icons/fa";
import { GetOrdersByOrganizationIdNew } from "../../../../apollo/orderQueries";
import { useQuery } from "@apollo/client";
import { globalState } from "../../../../state/store";
import { useHookstate } from "@hookstate/core";
import { OrderStageEnum } from "../../../../constants/enums";
import moment from "moment";

export default function ProductSold() {
  const user = useHookstate(globalState.user);
  const [productState, setProductState] = useState([
    {
      product_name: "",
      product_sold: 0,
      sold_date: "",
    },
  ]);
  const [total, settotal] = useState(0);
  const productName: string[] = [];
  const productSold: number[] = [];
  productState.map((item) => {
    productName.push(item.product_name);
    productSold.push(item.product_sold);
  });
  const {
    loading: orgOrdersLoading,
    error: orgOrdersError,
    data: orgOrdersData,
  } = useQuery(GetOrdersByOrganizationIdNew, {
    variables: { orgId: user!.value!.organization?.id },
  });
  useEffect(() => {
    if (
      orgOrdersData &&
      orgOrdersData.orders &&
      orgOrdersData.orders.lookupByOrganizationNew
    ) {
      const formattedOrdersData = orgOrdersData.orders.lookupByOrganizationNew
        .filter((order) => order.stage !== OrderStageEnum.DRAFT)
        .map((order) => {
          const formattedDate = moment(order.createdAt).format("LL");

          return {
            product_name: formattedDate,
            product_sold: order.noOfProducts,
            sold_date: formattedDate,
          };
        });
      const totalPorducts = formattedOrdersData.reduce(
        (sum, order) => sum + order.product_sold,
        0
      );

      setProductState(formattedOrdersData);
      settotal(totalPorducts);
    }
  }, [orgOrdersData]);
  const [chartData, setChartData] = useState({
    options: {
      chart: {
        id: "donut-chart",
      },
      legend: {
        show: true,
      },
      labels: productName,
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
              },
            },
          },
        },
      },
    },
    series: productSold,
    type: "donut",
  });
  useEffect(() => {
    // Initialize the chart data with the initial productState
    const initialChartData = getChartData(productState);
    setChartData(initialChartData);
  }, [productState]);
  const getChartData = (data) => {
    const productNameAll = [];
    const productSoldAll = [];
    data.forEach((item) => {
      productNameAll.push(item.product_name);
      productSoldAll.push(item.product_sold);
    });

    return {
      ...chartData,
      options: {
        ...chartData.options,
        labels: productNameAll,
      },
      series: productSoldAll,
    };
  };
  const handleTabChange = (selectedTab: string) => {
    const today = new Date();
    let newData: any[] = [];
    switch (selectedTab) {
      case "DAY":
        const currentDay = new Date().toISOString().slice(0, 10);
        const filteredDataForDay = productState.filter(
          (item) => item.sold_date === currentDay
        );
        const productNameDAY: string[] = [];
        const productSoldDAY: number[] = [];
        filteredDataForDay.forEach((item) => {
          productNameDAY.push(item.product_name);
          productSoldDAY.push(item.product_sold);
        });
        newData = productSoldDAY;
        setChartData({
          ...chartData,
          options: {
            ...chartData.options,
            labels: productNameDAY,
          },
          series: newData,
        });
        break;
      case "WEEK":
        const firstDayOfWeek = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - today.getDay()
        );
        const lastDayOfWeek = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + (6 - today.getDay())
        );
        const filteredDataForWeek = productState.filter((item) => {
          const soldDate = new Date(item.sold_date);
          return soldDate >= firstDayOfWeek && soldDate <= lastDayOfWeek;
        });
        let productNameWEEK: string[] = [];
        let productSoldWEEK: number[] = [];
        filteredDataForWeek.forEach((item) => {
          productNameWEEK.push(item.product_name);
          productSoldWEEK.push(item.product_sold);
        });
        newData = productSoldWEEK;
        setChartData({
          ...chartData,
          options: {
            ...chartData.options,
            labels: productNameWEEK,
          },
          series: newData,
        });
        break;
      case "MONTH":
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        );
        const filteredDataForMonth = productState.filter((item) => {
          const soldDate = new Date(item.sold_date);
          return soldDate >= firstDayOfMonth && soldDate <= lastDayOfMonth;
        });
        // create arrays of product names and quantities from filtered data
        let productNameMONTH: string[] = [];
        let productSoldMONTH: number[] = [];
        filteredDataForMonth.forEach((item) => {
          productNameMONTH.push(item.product_name);
          productSoldMONTH.push(item.product_sold);
        });
        newData = productSoldMONTH;
        setChartData({
          ...chartData,
          options: {
            ...chartData.options,
            labels: productNameMONTH,
          },
          series: newData,
        });
        break;
      case "QUARTER":
        const lastThreeMonths = [
          new Date(today.getFullYear(), today.getMonth() - 2, 1),
          new Date(today.getFullYear(), today.getMonth() - 1, 1),
          new Date(today.getFullYear(), today.getMonth(), 1),
          new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        ];
        const filteredData = productState.filter((item) => {
          const soldDate = new Date(item.sold_date);
          return (
            soldDate >= lastThreeMonths[0] && soldDate <= lastThreeMonths[3]
          );
        });
        // create arrays of product names and quantities from filtered data
        let productNameQUARTER: string[] = [];
        let productSoldQUARTER: number[] = [];
        filteredData.forEach((item) => {
          productNameQUARTER.push(item.product_name);
          productSoldQUARTER.push(item.product_sold);
        });
        newData = productSoldQUARTER;
        setChartData({
          ...chartData,
          options: {
            ...chartData.options,
            labels: productNameQUARTER,
          },
          series: newData,
        });
        break;
      case "YEAR":
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const lastDayOfYear = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        );
        const filteredDataForYear = productState.filter((item) => {
          const soldDate = new Date(item.sold_date);
          return soldDate >= firstDayOfYear && soldDate <= lastDayOfYear;
        });
        let productNameYEAR: string[] = [];
        let productSoldYEAR: number[] = [];
        filteredDataForYear.forEach((item) => {
          productNameYEAR.push(item.product_name);
          productSoldYEAR.push(item.product_sold);
        });
        newData = productSoldYEAR;
        setChartData({
          ...chartData,
          options: {
            ...chartData.options,
            labels: productNameYEAR,
          },
          series: newData,
        });
        break;
      case "ALL":
        let productNameALL: string[] = [];
        let productSoldALL: number[] = [];
        productState.forEach((item) => {
          productNameALL.push(item.product_name);
          productSoldALL.push(item.product_sold);
        });
        newData = productSoldALL;
        setChartData({
          ...chartData,
          options: {
            ...chartData.options,
            labels: productNameALL,
          },
          series: newData,
        });
        break;
      default:
        break;
    }
  };
  return (
    <Box boxShadow={20} width='100%'>
      {orgOrdersLoading ? (
        <Box
          padding='6'
          boxShadow='lg'
          bg='greys.400'
          width='100%'
          minH='345px'
          maxH='235px'
          mt='20px'
          borderRadius='4px'
        >
          <SkeletonText mt='4' noOfLines={7} spacing='4' skeletonHeight='5' />
        </Box>
      ) : (
        <Card>
          <CardHeader>
            <Text fontWeight='semibold' fontSize='h6' mt={2}>
              Product Sold
            </Text>
            <Tabs colorScheme='gray' size={"xs"} isFitted={true}>
              <TabList>
                <Tab onClick={() => handleTabChange("DAY")}>Day</Tab>
                <Tab onClick={() => handleTabChange("WEEK")}>Week</Tab>
                <Tab onClick={() => handleTabChange("MONTH")}>Month</Tab>
                <Tab onClick={() => handleTabChange("QUARTER")}>Quarter</Tab>
                <Tab onClick={() => handleTabChange("YEAR")}>Year</Tab>
                <Tab onClick={() => handleTabChange("ALL")}>All</Tab>
              </TabList>
            </Tabs>
          </CardHeader>
          <CardBody>
            <VStack width='100%' alignItems='flex-start'>
              <Text fontSize='h6'>Total</Text>
              <HStack spacing={3}>
                <Text fontSize='h6'>{total} Items</Text>
                <FaArrowCircleUp color='green' />
                {/* <Text fontSize='h6' color='blue'>
                2.5%
              </Text> */}
              </HStack>
            </VStack>
            {/* <Box width='100%' height='100%'> */}
            <Box width='100%' height='100%'>
              <Chart
                options={chartData.options}
                series={chartData.series}
                type={chartData.type}
                // height={330}
                // width="100%"
                // height='100%'
              />
            </Box>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}

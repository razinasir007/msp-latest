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
import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import { FaArrowCircleUp } from "react-icons/fa";
import { useQuery } from "@apollo/client";
import { GetOrdersByOrganizationIdNew } from "../../../../apollo/orderQueries";
import { useHookstate } from "@hookstate/core";
import { globalState } from "../../../../state/store";
import { OrderStageEnum } from "../../../../constants/enums";
import moment from "moment";

export default function ProfitChart() {
  const user = useHookstate(globalState.user);
  const [data, setData] = useState<any>({ x: [], y: [] });
  const [profitData, setProfitData] = useState([
    {
      createdAt: "",
      price: "",
      cost: "",
      totalProfitforProduct: 0,
    },
  ]);
  const [profitTotal, setProfitTotal] = useState(0);
  var xaxis: string[] = [];
  var yaxis: number[] = [];
  const [activeTab, setActiveTab] = useState("Day");
  const getData = () => {
    return {
      categories: data.x,
      series: [
        {
          name: "Profit",
          data: data.y,
        },
      ],
    };
  };
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
      const formattedData = orgOrdersData.orders.lookupByOrganizationNew

        .filter((order) => order.stage !== OrderStageEnum.DRAFT)
        .map((product) => {
          const profit = parseFloat(product.price) - parseFloat(product.cost);
          return {
            createdAt: moment(product.createdAt).format("LL"),
            price: product.price,
            cost: product.cost,
            totalProfitforProduct: profit.toFixed(2),
          };
        });
      const totalProfit = formattedData.reduce((acc, product) => {
        // Check if totalProfitforProduct is a valid number
        const totalProfitForProduct = parseFloat(product.totalProfitforProduct);
        if (!isNaN(totalProfitForProduct)) {
          return acc + totalProfitForProduct;
        } else {
          return acc;
        }
      }, 0);
      setProfitData(formattedData);
      setProfitTotal(totalProfit);
    }
  }, [orgOrdersData]);
  const [graphOptions, setGraphOptions] = useState<ApexOptions>({
    chart: {
      id: "apexchart-example",
    },
    xaxis: {
      categories: getData().categories,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    noData: {
      text: "No Data To Display",
    },
  });

  const [graphSeries, setGraphSeries] = useState(getData().series);

  const handleTabClick = (tabName: string) => {
    xaxis = [];
    yaxis = [];
    let filteredData = profitData;

    const today = new Date();
    let shouldIFilter = false;

    switch (tabName) {
      case "Day":
        const startTime = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0
        );
        const endTime = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );

        filteredData = profitData.filter((obj) => {
          const date = new Date(obj.createdAt);
          return date >= startTime && date <= endTime;
        });
        break;

      case "Week":
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

        filteredData = profitData.filter((obj) => {
          const date = new Date(obj.createdAt);
          return date >= firstDayOfWeek && date <= lastDayOfWeek;
        });
        break;

      case "Month":
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

        filteredData = profitData.filter((obj) => {
          const date = new Date(obj.createdAt);
          return date >= firstDayOfMonth && date <= lastDayOfMonth;
        });
        break;

      case "Quarter":
        // Adjust this logic based on your quarter calculation
        const startQuarter = new Date(
          today.getFullYear(),
          today.getMonth() - 2,
          1
        );
        const endQuarter = new Date(today.getFullYear(), today.getMonth(), 1);

        filteredData = profitData.filter((obj) => {
          const date = new Date(obj.createdAt);
          return date >= startQuarter && date <= endQuarter;
        });
        break;

      case "Year":
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const lastDayOfYear = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        );

        filteredData = profitData.filter((obj) => {
          const date = new Date(obj.createdAt);
          return date >= firstDayOfYear && date <= lastDayOfYear;
        });
        break;

      // "All" case can remain the same

      default:
        break;
    }

    filteredData.forEach((item) => {
      // Use toLocaleDateString for other cases
      xaxis.push(
        new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        })
      );
      yaxis.push(item.totalProfitforProduct);
    });

    setData({ x: xaxis, y: yaxis });
    setActiveTab(tabName);
  };

  useEffect(() => {
    setGraphOptions({
      ...graphOptions,
      xaxis: {
        categories: getData().categories,
      },
    });
    setGraphSeries(getData().series);
  }, [activeTab]);

  return (
    <Box boxShadow={20}>
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
            <Flex>
              <Text fontWeight='semibold' fontSize='h6' mt={2}>
                Profit
              </Text>
              <Spacer />
              <Tabs colorScheme='gray' size='xs'>
                <TabList>
                  <Tab onClick={() => handleTabClick("Day")} mr={4}>
                    Day
                  </Tab>
                  <Tab onClick={() => handleTabClick("Week")} mr={4}>
                    Week
                  </Tab>
                  <Tab onClick={() => handleTabClick("Month")} mr={4}>
                    Month
                  </Tab>
                  <Tab onClick={() => handleTabClick("Quarter")} mr={4}>
                    Quarter
                  </Tab>
                  <Tab onClick={() => handleTabClick("Year")} mr={4}>
                    Year
                  </Tab>
                  <Tab onClick={() => handleTabClick("All")} mr={4}>
                    All
                  </Tab>
                </TabList>
              </Tabs>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack width='100%' alignItems='flex-start'>
              <Text fontSize='h6'>Total</Text>
              <HStack spacing={3}>
                <Text fontSize='h6'>${profitTotal}</Text>
                <FaArrowCircleUp />
              </HStack>
            </VStack>
            <Box>
              <Chart
                options={graphOptions}
                type='line'
                series={graphSeries}
                width={"100%"}
                height={290}
              />
            </Box>
          </CardBody>
        </Card>
      )}
    </Box>
  );
}

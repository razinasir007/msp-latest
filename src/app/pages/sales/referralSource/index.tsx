import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Spacer,
  Tab,
  TabList,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ApexOptions } from "apexcharts";
import dummyData from "../../../../assets/MockData.json";
import Chart from "react-apexcharts";
import { FaArrowCircleUp } from "react-icons/fa";

export default function ReferralSource() {
  const [data, setData] = useState<any>({ x: [], y: [] });
  var xaxis: string[] = [];
  var yaxis: number[] = [];
  const [activeTab, setActiveTab] = useState("Day");
  const getData = () => {
    return {
      categories: data.x,
      series: [
        {
          name: "Series 1",
          data: data.y,
        },
      ],
    };
  };

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
    let filteredData = dummyData;
    const today = new Date();
    var shouldIFilter = false;

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
        filteredData = dummyData.filter((obj) => {
          const date = new Date(obj.order_date);
          return date >= startTime && date <= endTime;
        });
        const orderDataByHour = filteredData.reduce((acc, obj) => {
          const hour = new Date(obj.order_date).getHours();
          const hourInterval = Math.floor(hour / 4) * 4;
          const key = `${hourInterval}-${hourInterval + 4}`;
          if (acc[key]) {
            acc[key].order_sold += obj.order_sold;
          } else {
            acc[key] = {
              hourInterval: `${hourInterval} - ${hourInterval + 4}`,
              order_sold: obj.order_sold,
            };
          }
          return acc;
        }, {});

        const chartDataForHours = Object.values(orderDataByHour).sort(
          (a: any, b: any) =>
            parseInt(a.hourInterval) - parseInt(b.hourInterval)
        );

        chartDataForHours.forEach((item: any) => {
          xaxis.push(item.hourInterval);
          yaxis.push(item.order_sold);
        });
        shouldIFilter = true;
        break;
      case "Week":
        const monday: any = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - today.getDay() + 1
        );

        // Group the data by week and day
        const orderDataByWeekAndDay = dummyData.reduce((acc, obj) => {
          const date: any = new Date(obj.order_date);
          if (date >= monday) {
            const week = Math.floor(
              (date - monday) / (1000 * 60 * 60 * 24 * 7)
            );
            const day = date.toLocaleString("en-us", { weekday: "long" });
            const key = `${day} - Week ${week + 1}`;
            if (acc[key]) {
              acc[key].order_sold += obj.order_sold;
            } else {
              acc[key] = {
                week,
                day,
                order_sold: obj.order_sold,
              };
            }
          }
          return acc;
        }, {});

        // Sort the data by week and day
        const chartDataForWeek = Object.values(orderDataByWeekAndDay).sort(
          (a: any, b: any) => a.week - b.week || a.day.localeCompare(b.day)
        );

        // Generate the x and y axis data
        chartDataForWeek.forEach((item: any) => {
          xaxis.push(item.day + " - Week " + (item.week + 1));
          yaxis.push(item.order_sold);
        });

        // Set the filter flag to true
        shouldIFilter = true;
        break;
      case "Month":
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );
        filteredData = dummyData.filter(
          (obj) => new Date(obj.order_date) >= firstDayOfMonth
        );

        const orderDataByWeek = filteredData.reduce((acc, obj) => {
          const weekNumber = getWeekOfMonth(new Date(obj.order_date));
          const weekKey = `Week ${weekNumber}`;
          if (acc[weekKey]) {
            acc[weekKey].order_sold += obj.order_sold;
          } else {
            acc[weekKey] = {
              week: weekKey,
              order_sold: obj.order_sold,
            };
          }
          return acc;
        }, {});

        const chartDataForWeeks = Object.values(orderDataByWeek).sort(
          (a: any, b: any) =>
            parseInt(a.week.split(" ")[1]) - parseInt(b.week.split(" ")[1])
        );

        chartDataForWeeks.forEach((item: any) => {
          xaxis.push(item.week);
          yaxis.push(item.order_sold);
        });

        shouldIFilter = true;

        function getWeekOfMonth(date) {
          const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
          const dayOfWeek = firstDay.getDay();
          const adjustedDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + dayOfWeek - 1
          );
          const weekNumber = Math.floor(
            (adjustedDate.getDate() - 1 + firstDay.getDay()) / 7
          );
          return weekNumber + 1;
        }

        break;
      case "Quarter":
        const lastThreeMonths = [
          new Date(today.getFullYear(), today.getMonth() - 2, 1),
          new Date(today.getFullYear(), today.getMonth() - 1, 1),
          new Date(today.getFullYear(), today.getMonth(), 1),
          new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        ];
        filteredData = dummyData.filter((obj) => {
          const date = new Date(obj.order_date);
          return date >= lastThreeMonths[0] && date <= lastThreeMonths[3];
        });

        const orderDataByMonth = filteredData.reduce((acc, obj) => {
          const month = new Date(obj.order_date).toLocaleString("en-us", {
            month: "long",
          });
          if (acc[month]) {
            acc[month].order_sold += obj.order_sold;
          } else {
            acc[month] = {
              month,
              order_sold: obj.order_sold,
            };
          }
          return acc;
        }, {});

        const chartData = Object.values(orderDataByMonth).sort(
          (a, b) => new Date(a.month) - new Date(b.month)
        );

        chartData.forEach((item: any) => {
          xaxis.push(item.month);
          yaxis.push(item.order_sold);
        });
        shouldIFilter = true;
        break;

      case "Year":
        const orderDataByMonthForYearly = filteredData.reduce((acc, obj) => {
          const month = new Date(obj.order_date).toLocaleString("en-us", {
            month: "long",
          });
          if (acc[month]) {
            acc[month].order_sold += obj.order_sold;
          } else {
            acc[month] = {
              month,
              order_sold: obj.order_sold,
            };
          }
          return acc;
        }, {});

        const chartDataForYear = Object.values(orderDataByMonthForYearly).sort(
          (a, b) => new Date(a.month) - new Date(b.month)
        );
        chartDataForYear.forEach((item: any) => {
          xaxis.push(item.month);
          yaxis.push(item.order_sold);
        });
        shouldIFilter = true;
        break;
      default:
        const orderDataForAll = filteredData.reduce((acc, obj) => {
          const month = new Date(obj.order_date).toLocaleString("en-us", {
            month: "long",
          });
          if (acc[month]) {
            acc[month].order_sold += obj.order_sold;
          } else {
            acc[month] = {
              month,
              order_sold: obj.order_sold,
            };
          }
          return acc;
        }, {});

        const allDataForChart = Object.values(orderDataForAll).sort(
          (a, b) => new Date(a.month) - new Date(b.month)
        );
        allDataForChart.forEach((item: any) => {
          xaxis.push(item.month);
          yaxis.push(item.order_sold);
        });
        shouldIFilter = true;
        break;
    }
    if (!shouldIFilter) {
      filteredData.forEach((item) => {
        xaxis.push(item.order_date);
        yaxis.push(item.order_sold);
      });
    }

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
      <Card height={492}>
        <CardHeader>
          <Flex>
            <Text fontWeight='semibold' fontSize='h6' mt={2}>
              Referral Source
            </Text>
            <Spacer />
            <Tabs colorScheme='gray' size='xs'>
              <TabList>
                <Tab onClick={() => handleTabClick("Day")}>Day</Tab>
                <Tab onClick={() => handleTabClick("Week")}>Week</Tab>
                <Tab onClick={() => handleTabClick("Month")}>Month</Tab>
                <Tab onClick={() => handleTabClick("Quarter")}>Quarter</Tab>
                <Tab onClick={() => handleTabClick("Year")}>Year</Tab>
                <Tab onClick={() => handleTabClick("All")}>All</Tab>
              </TabList>
            </Tabs>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack width='100%' alignItems='flex-start'>
            <Text fontSize='h6'>Total</Text>
            <HStack spacing={3}>
              <Text fontSize='h6'>345 Items</Text>
              <FaArrowCircleUp />
              <Text fontSize='h6' color='blue'>
                2.5%
              </Text>
            </HStack>
          </VStack>
          <Chart
            options={graphOptions}
            type='bar'
            series={graphSeries}
            width={565}
            height={290}
          />
        </CardBody>
      </Card>
    </Box>
  );
}

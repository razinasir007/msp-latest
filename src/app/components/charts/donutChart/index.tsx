import React from "react";
import Chart from "react-apexcharts";

export default function DonutChart() {
  var options = {
    series: [44, 55, 41, 17, 15],
    title: {
      text: "Pie Chart",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
  return (
    <Chart
      options={options}
      series={options.series}
      type='donut'
      width={500}
      height={320}
    />
  );
}

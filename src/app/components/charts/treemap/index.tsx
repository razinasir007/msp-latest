import React from "react";
import Chart from "react-apexcharts";

export default function TreeMap() {
  var options = {
    series: [
      {
        data: [
          {
            x: "New Delhi",
            y: 218,
          },
          {
            x: "Kolkata",
            y: 149,
          },
          {
            x: "Mumbai",
            y: 184,
          },
          {
            x: "Ahmedabad",
            y: 55,
          },
          {
            x: "Bangaluru",
            y: 84,
          },
          {
            x: "Pune",
            y: 31,
          },
          {
            x: "Chennai",
            y: 70,
          },
          {
            x: "Jaipur",
            y: 30,
          },
          {
            x: "Surat",
            y: 44,
          },
          {
            x: "Hyderabad",
            y: 68,
          },
          {
            x: "Lucknow",
            y: 28,
          },
          {
            x: "Indore",
            y: 19,
          },
          {
            x: "Kanpur",
            y: 29,
          },
        ],
      },
    ],
    legend: {
      show: false,
    },
    chart: {
      height: 350,
    },
    title: {
      text: "Basic Treemap",
    },
  };

  return (
    <Chart
      options={options}
      series={options.series}
      type='treemap'
      width={500}
      height={320}
    />
  );
}

import React, { useEffect, useState } from 'react';
import Chart from 'react-google-charts';

const LineChart = ({ historicalData }) => {
  const [data, setData] = useState([["Date", "Prices"]]);

  useEffect(() => {
    if (historicalData) {
      const formattedData = historicalData.map((item) => [
        new Date(item.recorded_at),
        parseFloat(item.price),
      ]);
      setData([ ["Date", "Prices"], ...formattedData ]);
    }
  }, [historicalData]);

  const options = {
    title: "Historical Price Data",
    curveType: "function",
    legend: { position: "bottom" },
    backgroundColor: "#f4f4f4",
    hAxis: {
      textStyle: { color: "#333", fontSize: 12 },
    },
    vAxis: {
      textStyle: { color: "#333", fontSize: 12 },
      gridlines: { color: "#ccc" },
    },
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Chart
        chartType="LineChart"
        data={data}
        options={options}
        width="100%"
        height="100%"
      />
    </div>
  );
};

export default LineChart;

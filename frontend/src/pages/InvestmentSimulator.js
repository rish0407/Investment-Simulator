
import React, { useState } from "react";
import Chart from "chart.js/auto";

const InvestmentSimulator = () => {
  const [symbol, setSymbol] = useState("AAPL");
  const [amount, setAmount] = useState(1000);
  const [strategy, setStrategy] = useState("dca");
  const [timeline, setTimeline] = useState([]);
  const [values, setValues] = useState([]);
  const [finalValue, setFinalValue] = useState(null);

  const fetchSimulation = async () => {
    const res = await fetch("http://localhost:5000/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symbol,
        strategy,
        amount,
        start_date: "2020-01-01",
      }),
    });
    const data = await res.json();
    setTimeline(data.timeline);
    setValues(data.values);
    setFinalValue(data.final_value);
    drawChart(data.timeline, data.values);
  };

  const drawChart = (labels, data) => {
    const canvas = document.getElementById("chart");
    if (Chart.getChart(canvas)) {
      Chart.getChart(canvas).destroy();
    }
    new Chart(canvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Investment Value",
            data: data,
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 2,
            fill: false,
          },
        ],
      },
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Investment Simulator</h2>
      <label>Symbol: </label>
      <input value={symbol} onChange={(e) => setSymbol(e.target.value)} /><br />
      <label>Amount (USD): </label>
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /><br />
      <label>Strategy: </label>
      <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
        <option value="dca">Dollar Cost Averaging</option>
        <option value="lump_sum">Lump Sum</option>
      </select><br />
      <button onClick={fetchSimulation}>Simulate</button>
      {finalValue && <h3>Final Value: ${finalValue}</h3>}
      <canvas id="chart" width="800" height="400"></canvas>
    </div>
  );
};

export default InvestmentSimulator;

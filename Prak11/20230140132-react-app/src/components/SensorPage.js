import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Registrasi Chart.js (WAJIB)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SensorPage() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/iot/history"
      );

      const dataSensor = response.data.data;

      if (!dataSensor || dataSensor.length === 0) {
        setLoading(false);
        return;
      }

      const labels = dataSensor.map((item) =>
        new Date(item.createdAt).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      const dataSuhu = dataSensor.map((item) => item.suhu);
      const dataLembab = dataSensor.map((item) => item.kelembaban);

      setChartData({
        labels,
        datasets: [
          {
            label: "Suhu (°C)",
            data: dataSuhu,
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.4)",
            tension: 0.3,
          },
          {
            label: "Kelembaban (%)",
            data: dataLembab,
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.4)",
            tension: 0.3,
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error("❌ Gagal ambil data sensor:", error);
      setLoading(false);
    }
  };

  // Load data + auto refresh
  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Monitoring Suhu & Kelembaban (Realtime)",
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard Monitoring IoT
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        {loading ? (
          <p className="text-center text-gray-500">Memuat data sensor...</p>
        ) : chartData ? (
          <Line data={chartData} options={options} />
        ) : (
          <p className="text-center text-gray-500">
            Data sensor belum tersedia
          </p>
        )}
      </div>
    </div>
  );
}

export default SensorPage;

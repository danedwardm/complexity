import React, { useEffect, useState, useRef } from "react";
import { Pie, Bar } from "react-chartjs-2";
import api from "../api/axiosInstance";
import NavBar from "../Components/NavBar";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
  Title
);

const Analysis = () => {
  const [featuresData, setFeaturesData] = useState([]);
  const [barangayData, setBarangayData] = useState([]);
  const [cityProvinceData, setCityProvinceData] = useState([]);
  const barChartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/features"); // Fetch features data
        setFeaturesData(res.data); // Store features data
        console.log(res.data); // Log to check the fetched data

        // Process the features data to get the Barangay counts
        const processedBarangayData = processBarangayData(res.data);
        setBarangayData(processedBarangayData);

        // Process the features data to get the City/Province counts
        const processedCityProvinceData = processCityProvinceData(res.data);
        setCityProvinceData(processedCityProvinceData);
      } catch (error) {
        console.error("Fetching features error: ", error);
      }
    };
    fetchData();
  }, []);

  // Extract Barangay numbers and their counts
  const processBarangayData = (featuresData) => {
    const barangayCounts = {};

    featuresData.forEach((feature) => {
      const barangayNumber = extractBarangayNumber(feature.location);
      if (barangayNumber) {
        barangayCounts[barangayNumber] =
          (barangayCounts[barangayNumber] || 0) + 1;
      }
    });

    return barangayCounts;
  };

  // Extract Barangay number from the location string
  const extractBarangayNumber = (location) => {
    if (typeof location === "string") {
      const match = location.match(/Barangay (\d+)/); // Regular expression to match "Barangay" followed by a number
      return match ? parseInt(match[1]) : null; // Return the number or null if not found
    }
    return null;
  };

  const extractCityOrProvince = (location) => {
    if (typeof location === "string") {
      // Match the part of the string that represents the city or province
      const match = location.match(
        /([A-Za-z\s]+)(?=\s*,\s*(?:Northern Manila District| Manila District|Metro Manila|Central Luzon|Luzon|Philippines))/ // Match city/province before the mentioned terms
      );
      // Check if the match was successful
      if (match && match[1]) {
        return match[1].trim(); // Return the city/province name
      }
    }
    return null; // Return null if no match is found or location is not a string
  };

  // Process the features data to get the City/Province counts
  const processCityProvinceData = (featuresData) => {
    const cityProvinceCounts = {};

    featuresData.forEach((feature) => {
      const cityProvince = extractCityOrProvince(feature.location);
      if (cityProvince) {
        cityProvinceCounts[cityProvince] =
          (cityProvinceCounts[cityProvince] || 0) + 1;
      } else {
        // console.log("No city/province found for location:", feature.location);
      }
    });

    return cityProvinceCounts;
  };

  // Process the features data to get fire level counts (Low vs High)
  const processFireLevelData = (featuresData) => {
    const fireLevelCounts = { Low: 0, High: 0 };

    featuresData.forEach((feature) => {
      const fireLevel = feature.Fire_Level; // Assuming 'fire_level' is 0 (Low) or 1 (High)
      if (fireLevel === 0) {
        fireLevelCounts.Low += 1;
      } else if (fireLevel === 1) {
        fireLevelCounts.High += 1;
      }
    });

    return fireLevelCounts;
  };

  const fireLevelData = processFireLevelData(featuresData);

  // Prepare data for Fire Level Pie Chart
  const fireLevelPieChartData = {
    labels: ["Low", "High"], // Fire levels
    datasets: [
      {
        data: [fireLevelData.Low, fireLevelData.High], // Count of Low and High
        backgroundColor: ["#FF6384", "#36A2EB"], // Customize colors
      },
    ],
  };

  // Prepare data for Barangay Pie Chart
  const barangayPieChartData = {
    labels: Object.keys(barangayData), // Barangay numbers
    datasets: [
      {
        data: Object.values(barangayData), // Count of each Barangay
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#FF9F40",
        ], // Customize colors
      },
    ],
  };

  // Prepare data for City/Province Pie Chart
  const cityProvincePieChartData = {
    labels: Object.keys(cityProvinceData), // City/Province names
    datasets: [
      {
        data: Object.values(cityProvinceData), // Count of each City/Province
        backgroundColor: [
          "#FF5733",
          "#33FF57",
          "#FF33A1",
          "#3357FF",
          "#9C33FF",
        ], // Customize colors
      },
    ],
  };

  // Process the features data to get the report counts per hour
  const processReportHourData = (featuresData) => {
    const hoursCount = Array(24).fill(0); // Create an array to count occurrences for each hour (0-23)

    featuresData.forEach((feature) => {
      const reportDate = feature.report_date;
      if (reportDate) {
        const hour = new Date(reportDate).getHours(); // Extract the hour (0-23)
        hoursCount[hour] += 1; // Increment the count for that hour
      }
    });

    return hoursCount;
  };

  const reportHourData = processReportHourData(featuresData);

  // Prepare data for the Bar Chart
  const barChartData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`), // Labels for the hours (0:00, 1:00, ..., 23:00)
    datasets: [
      {
        label: "Number of Reports",
        data: reportHourData, // Report counts for each hour
        backgroundColor: "#36A2EB", // Customize color
        borderColor: "#1E90FF", // Customize border color
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: false,
        text: "Reports Distribution by Hour",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Hour of the Day",
        },
      },
      y: {
        title: {
          display: true,
          text: "Number of Reports",
        },
        beginAtZero: true,
      },
    },
  };

  // Cleanup Bar chart on unmount or before each render
  useEffect(() => {
    const chartInstance = barChartRef.current?.chartInstance;
    if (chartInstance) {
      chartInstance.destroy(); // Destroy the previous chart instance
    }
  }, [featuresData]); // Cleanup when featuresData changes

  return (
    <div className="relative bg-white h-[100vh] w-[100vw] overflow-hidden">
      <div>
        <div className="absolute h-[30vh] w-[30vh] bg-[#ffe3e3] rounded-[20px] rotate-45 -top-24 -left-24 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-[#ffe3e3] rounded-[20px] rotate-45 top-2/3 left-0 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-[#ffe3e3] rounded-[20px] rotate-45 top-0 left-1/3 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-[#ffe3e3] rounded-[20px] rotate-45 -top-24 -right-10 z-10"></div>
        <div className="absolute h-[30vh] w-[30vh] bg-[#ffe3e3] rounded-[20px] rotate-45 top-96 left-2/3 z-10"></div>
      </div>
      <div className="relative h-[100vh] w-[100vw] flex flex-col z-20 overflow-auto">
        <NavBar />
        <div className="flex flex-col items-center justify-start w-full h-full mt-[13vh]">
          <div className="w-full flex lg:text-xl text-xs font-extrabold px-5 justify-center items-center text-center text-black mt-6">
            Analysis
          </div>

          {/* Render Barangay Pie Chart */}
          <div className="flex flex-col md:flex-row justify-center items-center w-full gap-6">
            <div className="w-[80%] md:w-[30%] mt-6">
              <div className="text-lg font-bold text-center text-black">
                Barangay Distribution
              </div>
              <Pie data={barangayPieChartData} />
            </div>

            {/* Render City/Province Pie Chart */}
            <div className="w-[80%] md:w-[30%] mt-6">
              <div className="text-lg font-bold text-center text-black">
                City/Province Distribution
              </div>
              <Pie data={cityProvincePieChartData} />
            </div>

            <div className="w-[80%] md:w-[30%] mt-6">
              <div className="text-lg font-bold text-center text-black">
                Fire Level Distribution
              </div>
              <Pie data={fireLevelPieChartData} />
            </div>
          </div>

          <div className="w-[80%] mt-6">
            <div className="text-lg font-bold text-center text-black">
              Report Distribution by Hour
            </div>
            <Bar ref={barChartRef} data={barChartData} options={options} />
          </div>
          <div className="mt-[5vh] text-white">.</div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;

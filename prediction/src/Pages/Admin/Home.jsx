import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../../Components/NavBar";
import Report from "../../Components/Report";
import ReviewModal from "../../Components/Review";
import currentData from "../../Components/Data.json"; // The imported report data
import { FaFire, FaAngleLeft, FaAngleRight } from "react-icons/fa";

const Home = () => {
  const [showReport, setShowReport] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Number of items per page
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Correctly reference your API key
  const [location, setLocation] = useState({
    lat: 14.9767, // Default fallback coordinates (e.g., UCC South Campus)
    lng: 120.9705,
  });
  const [address, setAddress] = useState(""); // New state to store the address
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleReport = () => setShowReport(!showReport);
  const closeModal = () => setShowReview(!showReview);

  // Pagination logic
  const totalItems = currentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the data based on the current page
  const currentReports = currentData.slice(indexOfFirstItem, indexOfLastItem);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Handle page navigation
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleReviewClick = (report) => {
    setSelectedReport(report);
    setShowReview(true);
  };

  // Fetch current location using geolocation
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Fetch weather data based on the current location
  const fetchWeatherData = async (lat, lon) => {
    const API_KEY = "b29aa0efcb4db33afa698232bfb7b3a2"; // Replace with your OpenWeatherMap API key
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(WEATHER_API_URL);
      console.log(response.data); // Log the response to see the structure of the data
      setWeatherData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Error fetching weather data");
      setLoading(false);
    }
  };

  // Function to fetch the address based on latitude and longitude
  const fetchAddress = async (lat, lng) => {
    const GEOCODE_API_URL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapsApiKey}`;

    try {
      const response = await axios.get(GEOCODE_API_URL);
      console.log(response.data); // Log the API response to inspect the structure
      if (response.data.results && response.data.results.length > 0) {
        const formattedAddress = response.data.results[0].formatted_address;
        setAddress(formattedAddress);
      } else {
        setAddress("Address not found");
      }
    } catch (err) {
      console.error("Error fetching address:", err);
      setAddress("Error fetching address");
    }
  };

  // Fetch the weather data and address whenever location changes
  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location.lat && location.lng) {
      fetchWeatherData(location.lat, location.lng);
      fetchAddress(location.lat, location.lng); // Fetch address after location is set
    }
  }, [location]);
  console.log("location", location);

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
        <div className="flex flex-col items-center justify-start w-full h-full mt-[15vh]">
          <div className="md:text-5xl text-4xl font-extrabold text-center italic text-black mb-2">
            How Much Will Fire Cost Your Neighborhood?
          </div>
          <div className="w-full flex lg:text-xl text-xs font-semibold px-5 justify-center items-center text-center text-black mt-6">
            Predicting fire level and damage cost in your neighborhood
          </div>
          {/* Display Address */}
          {address && (
            <div className="w-full text-center font-semibold mt-4">
              <div className="bg-white border border-y-[#d10606] w-full p-4 mt-3 text-center">
                {address}
              </div>
            </div>
          )}

          {/* Display the weather data if available */}
          {loading && <div>Loading weather data...</div>}
          {error && <div>{error}</div>}
          {weatherData && (
            <div className="w-full h-auto flex flex-col md:flex-row items-center justify-center gap-2 px-12 md:px-32 mt-8">
              <div className="w-full flex-col md:mr-5">
                <div className="font-bold">Temperature</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold">
                  {weatherData.main.temp}°C
                </div>
              </div>
              <div className="w-full flex-col md:ml-5">
                <div className="font-bold">Weather</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center capitalize font-semibold">
                  {weatherData.weather[0].description}
                </div>
              </div>
              <div className="w-full flex-col md:ml-5">
                <div className="font-bold">Humidity</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center capitalize font-semibold">
                  {weatherData.main.humidity}%
                </div>
              </div>
              <div className="w-full flex-col md:ml-5">
                <div className="font-bold">Pressure</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center capitalize font-semibold">
                  {weatherData.main.pressure} hPa
                </div>
              </div>
              <div className="w-full flex-col md:ml-5">
                <div className="font-bold">Wind Speed</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center capitalize font-semibold">
                  {weatherData.wind.speed} m/s
                </div>
              </div>
            </div>
          )}

          <div className="w-full h-auto flex flex-col md:flex-row items-center justify-center gap-2 px-12 md:px-32 mt-8">
            <div className="w-full flex-col md:mr-5">
              <div className="font-bold">Fire Level</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold">
                Fire Level Prediction
              </div>
            </div>
            <div className="w-full flex-col md:ml-5">
              <div className="font-bold">Fire Damage Cost</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold">
                Fire Damage Cost Prediction
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center w-full h-auto mt-8 gap-6 md:gap-14 pb-10">
            <button className="w-auto flex flex-row items-center justify-center text-lg font-semibold rounded-lg px-12 py-3 text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white">
              PREDICT
            </button>
            <button
              onClick={toggleReport} // Toggle modal visibility
              className="w-auto flex flex-row items-center justify-center text-lg font-semibold rounded-lg px-8 py-3 text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white"
            >
              REPORT FIRE
            </button>
          </div>

          {/* Report Cards Section */}
          <div className="bg-white border-2 border-[#d10606] flex flex-col rounded-lg antialiased w-[90vw] mx-8 mt-6">
            {/* header */}
            <div className="flex flex-row justify-between bg-[#d10606]">
              <div className="flex justify-center items-center py-3 px-8">
                <p className="text-white font-semibold text-sm">reports</p>
              </div>
            </div>

            {/* Card report */}
            <div className="w-full px-5 py-5 flex flex-wrap gap-8 md:justify-start justify-center">
              {currentReports
                .sort(
                  (a, b) => new Date(b.report_date) - new Date(a.report_date)
                ) // Sort in descending order
                .map((data, index) => {
                  const reportDate = new Date(data.report_date);
                  const formattedDate = reportDate.toLocaleDateString(); // e.g., "10/28/2024"
                  const formattedTime = reportDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={index}
                      className="bg-[#FAF5FF] min-w-[370px] max-w-[370px] min-h-[250px] border border-[#d10606] rounded-lg p-6 flex flex-col mt-2"
                    >
                      <div className="flex flex-col flex-1">
                        <div className="flex gap-4">
                          <div className="flex items-center justify-center rounded-md">
                            <div className="bg-square p-4 rounded-lg">
                              <FaFire className="text-xl text-[#d10606]" />
                            </div>
                          </div>
                          <div className="flex flex-col justify-between py-1 w-full">
                            <div className="grid gap-1 text-start">
                              <p className="text-xs font-bold text-[#113e21] truncate">
                                {data.username}
                              </p>
                              <p className="text-xs font-normal text-[#2f2f2f] capitalize overflow-hidden text-ellipsis line-clamp-2 ">
                                {data.location}
                              </p>
                              <p className="text-xs font-normal text-[#2f2f2f] capitalize overflow-hidden text-ellipsis line-clamp-2 ">
                                {data.weather_condition}
                              </p>
                              <p className="text-xs font-normal text-[#2f2f2f] capitalize truncate">
                                {`${formattedDate} ${formattedTime}`}
                              </p>
                              <p className="text-xs capitalize">
                                Fire Level:{" "}
                                {data.estimated_fire_level === "High" ? (
                                  <span className="text-[#a10b00] font-bold">
                                    {data.estimated_fire_level.toUpperCase()}
                                  </span>
                                ) : data.estimated_fire_level === "Medium" ? (
                                  <span className="text-[#6e4615] font-bold">
                                    {data.estimated_fire_level.toUpperCase()}
                                  </span>
                                ) : data.estimated_fire_level === "Low" ? (
                                  <span className="text-[#FFA500] font-bold">
                                    {data.estimated_fire_level.toUpperCase()}
                                  </span>
                                ) : (
                                  <span className="text-[#363636] font-bold">
                                    {data.estimated_fire_level.toUpperCase()}
                                  </span>
                                )}
                              </p>
                              <p
                                className={`text-xs font-bold capitalize truncate ${
                                  data.is_validated
                                    ? "text-[#007a3f]"
                                    : "text-[#a10b00]"
                                }`}
                              >
                                {data.is_validated
                                  ? "VALIDATED"
                                  : "NOT VALIDATED"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center items-center mt-4">
                        <button
                          className="w-full py-2 px-4 font-semibold rounded-md truncate text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white"
                          onClick={() => handleReviewClick(data)}
                        >
                          REVIEW
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-row gap-1 items-center justify-end w-full px-12 py-6">
                <button
                  className="text-black p-1 rounded-md ease-in-out duration-500 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    prevPage();
                  }}
                  disabled={currentPage === 1}
                >
                  <FaAngleLeft className="text-xs text-[#b00505]" />
                </button>
                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={`p-1 ease-in-out duration-500 font-semibold ${
                      pageNumber === currentPage
                        ? "text-md text-[#b00505] font-bold"
                        : "text-xs text-textSecond font-semibold"
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  className="text-black p-1 rounded-md ease-in-out duration-500 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    nextPage();
                  }}
                  disabled={currentPage === totalPages}
                >
                  <FaAngleRight className="text-xs text-[#b00505]" />
                </button>
              </div>
            )}
          </div>
          <div className="mt-[5vh] text-white">.</div>
        </div>
      </div>
      <Report isVisible={showReport} onClose={toggleReport} />
      <ReviewModal
        isVisible={showReview}
        onClose={closeModal}
        reportData={selectedReport}
      />
    </div>
  );
};

export default Home;

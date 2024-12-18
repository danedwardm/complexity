import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../Components/NavBar";

import { TbTemperature } from "react-icons/tb";
import { TiWeatherWindy } from "react-icons/ti";
import { WiHumidity } from "react-icons/wi";
import { MdCompress, MdOutlineLocalFireDepartment } from "react-icons/md";
import { FaPesoSign } from "react-icons/fa6";
import { PiTarget } from "react-icons/pi";

const Home = () => {
  const [showReport, setShowReport] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Correctly reference your API key
  const [location, setLocation] = useState({
    // lat: 14.9767, // Default fallback coordinates (e.g., UCC South Campus)
    // lng: 120.9705,
  });
  const [address, setAddress] = useState(""); // New state to store the address
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      // console.log(response.data); // Log the response to see the structure of the data
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
    const GEOCODE_API_URL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    try {
      const response = await axios.get(GEOCODE_API_URL);
      // console.log(response.data); // Log the API response to inspect the structure

      if (response.data && response.data.display_name) {
        const formattedAddress = response.data.display_name; // Full address as a string
        setAddress(formattedAddress); // Update state with the address
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

  // Dropdown values for Weather and Season
  const weatherOptions = [
    "Haze",
    "Passing Clouds",
    "Scattered Clouds",
    "Overcast",
  ];

  const seasonOptions = ["Dry", "Summer", "Wet"];

  const [selectedWeather, setSelectedWeather] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");

  const handleWeatherChange = (e) => {
    setSelectedWeather(e.target.value);
  };

  const handleSeasonChange = (e) => {
    setSelectedSeason(e.target.value);
  };

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
        <div className="flex flex-col items-center justify-start w-full h-full mt-[14vh]">
          <div className="md:text-5xl text-4xl font-extrabold text-center italic text-black mb-2">
            How Much Will Fire Cost Your Neighborhood?
          </div>
          <div className="w-full flex lg:text-xl text-xs font-semibold px-5 justify-center items-center text-center text-black mt-6">
            Predicting fire level and damage cost in your neighborhood
            {"\u00A0\u00A0"}
            <strong>TEST PAGE</strong>
          </div>
          {/* Display Address */}
          <div className="w-full text-center font-semibold mt-4">
            {address ? (
              <div className="w-full text-center font-semibold mt-4">
                <div className="bg-white border border-y-[#d10606] w-full p-4 mt-3 text-center">
                  {address}
                </div>
              </div>
            ) : (
              <div className="w-full text-center font-semibold mt-4">
                <div className="bg-white border border-y-[#d10606] w-full p-4 mt-3 text-center">
                  No address found. Turn on Location
                </div>
              </div>
            )}
          </div>

          {/* Display the weather data if available */}

          <div className="w-full h-auto flex flex-col md:flex-row items-center justify-center gap-5 px-12 md:px-32 mt-6">
            <div className="w-full flex-col">
              <div className="font-bold">Temperature</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                <TbTemperature className="text-xl" />
                <input
                  type="number"
                  className="flex-1 w-1/2 text-center bg-transparent border-none outline-none font-semibold"
                  placeholder="Temperature"
                />
                {"°C"}
              </div>
            </div>
            <div className="w-full flex-col">
              <div className="font-bold">Weather</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3">
                <select
                  value={selectedWeather}
                  onChange={handleWeatherChange}
                  className="w-full bg-transparent border-none outline-none text-start font-semibold"
                >
                  <option value="" disabled>
                    Select Weather
                  </option>
                  {weatherOptions.map((weather, index) => (
                    <option key={index} value={weather}>
                      {weather}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Season Dropdown */}
            <div className="w-full flex-col">
              <div className="font-bold">Season</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3">
                <select
                  value={selectedSeason}
                  onChange={handleSeasonChange}
                  className="w-full bg-transparent border-none outline-none text-start font-semibold"
                >
                  <option value="" disabled>
                    Select Season
                  </option>
                  {seasonOptions.map((season, index) => (
                    <option key={index} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-full flex-col ">
              <div className="font-bold">Humidity</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                <WiHumidity className="text-xl" />
                <input
                  type="number"
                  className="flex-1 w-1/2 text-center bg-transparent border-none outline-none font-semibold"
                  placeholder="Humidity"
                />
                {"%"}
              </div>
            </div>
            <div className="w-full flex-col ">
              <div className="font-bold">Pressure</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                <MdCompress className="text-xl" />
                <input
                  type="number"
                  className="flex-1 w-1/2 text-center bg-transparent border-none outline-none font-semibold"
                  placeholder="Pressure"
                />
                {"hPa"}
              </div>
            </div>
            <div className="w-full flex-col ">
              <div className="font-bold">Wind Speed</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                <TiWeatherWindy className="text-xl" />
                <input
                  type="number"
                  className="flex-1 w-1/2 text-center bg-transparent border-none outline-none font-semibold"
                  placeholder="Wind Speed"
                />
                {"m/s"}
              </div>
            </div>
          </div>

          <div className="w-full h-auto flex flex-col md:flex-row items-center justify-center gap-5 px-12 md:px-32 mt-6">
            <div className="w-full flex-col ">
              <div className="font-bold">Accuracy</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                <PiTarget className="text-xl" />
                <span className="flex-1 text-center">{"Loading..."}</span>
                {"%"}
              </div>
            </div>
            <div className="w-full flex-col ">
              <div className="font-bold">Possible Fire Level</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                <MdOutlineLocalFireDepartment className="text-xl" />
                <span className="flex-1 text-center">{"Loading..."}</span>{" "}
              </div>
            </div>
            <div className="w-full flex-col">
              <div className="font-bold">Possible Fire Damage Cost</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                <FaPesoSign className="text-sm" />
                <span className="flex-1 text-center">{"Loading..."}</span>{" "}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center w-full h-auto mt-6 gap-6 md:gap-14 pb-5">
            <button className="w-auto flex flex-row items-center justify-center text-lg font-semibold rounded-lg px-12 py-3 text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white">
              PREDICT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

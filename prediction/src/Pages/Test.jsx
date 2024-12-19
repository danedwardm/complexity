import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../Components/NavBar";
import MapPickerModal from "../Components/MapPickerModal";

import { TbTemperature } from "react-icons/tb";
import { TiWeatherWindy } from "react-icons/ti";
import { WiHumidity } from "react-icons/wi";
import { MdCompress, MdOutlineLocalFireDepartment } from "react-icons/md";
import { FaPesoSign } from "react-icons/fa6";
import { FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { PiTarget } from "react-icons/pi";
import api from "../api/axiosInstance";
import { useAuth } from "../AuthProvider/AuthContext";

const Home = () => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Correctly reference your API key
  const [location, setLocation] = useState({
    // lat: 14.9767, // Default fallback coordinates (e.g., UCC South Campus)
    // lng: 120.9705,
  });
  const { logOut } = useAuth();
  const [address, setAddress] = useState(""); // New state to store the address
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [temperature, setTemperature] = useState(weatherData?.main?.temp || "");
  const [humidity, setHumidity] = useState(weatherData?.main?.humidity || "");
  const [pressure, setPressure] = useState(weatherData?.main?.pressure || "");
  const [wind, setWind] = useState(weatherData?.wind?.speed || "");
  const [fireLevel, setFireLevel] = useState("");
  const [totalCost, setTotalCost] = useState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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
  // Dropdown values for Weather and Season
  const weatherOptions = [
    "Haze",
    "Passing Clouds",
    "Scattered Clouds",
    "Overcast",
  ];

  const seasonOptions = ["Dry", "Summer", "Wet"];

  const [selectedWeather, setSelectedWeather] = useState(
    weatherData?.weather[0]?.description || ""
  );
  const [selectedSeason, setSelectedSeason] = useState("Dry");

  useEffect(() => {
    setTemperature(weatherData?.main?.temp || "");
    setHumidity(weatherData?.main?.humidity || "");
    setPressure(weatherData?.main?.pressure || "");
    setWind(weatherData?.wind?.speed || "");
    setSelectedWeather(weatherData?.weather[0]?.description || "");
  }, [weatherData]);

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

  const handleWeatherChange = (e) => setSelectedWeather(e.target.value);
  const handleSeasonChange = (e) => setSelectedSeason(e.target.value);

  const handlePrediction = async () => {
    try {
      if (!weatherData) {
        alert("Weather Data is Unavailable!");
        return;
      }

      console.log("Predicting...");
      setLoading(true);
      // Construct the payload
      const payload = {
        Barometer: parseFloat(pressure), // Ensure float type
        Weather_Haze: selectedWeather === "Haze" ? 1 : 0,
        Weather_Overcast: selectedWeather === "Overcast" ? 1 : 0,
        Passing_clouds: selectedWeather === "Passing Clouds" ? 1 : 0,
        Precipitation: parseFloat(humidity), // Ensure float type
        Scattered_clouds: selectedWeather === "Scattered Clouds" ? 1 : 0,
        Season_Dry: selectedSeason === "Dry" ? 1 : 0,
        Season_Summer: selectedSeason === "Summer" ? 1 : 0,
        Season_Wet: selectedSeason === "Wet" ? 1 : 0,
        Temperature: parseFloat(temperature), // Ensure float type
        Wind: parseFloat(wind), // Ensure float type
        location: address,
      };

      // Validate payload fields if necessary
      if (
        !payload.location ||
        !payload.Temperature ||
        !payload.Wind ||
        !payload.Barometer ||
        !selectedSeason ||
        !selectedWeather
      ) {
        alert("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const res = await api.post("/test-predict", payload);

      if (!res) {
        alert("Session Expired!");
        return;
      }

      if (res.data.error) {
        alert("Token Expired! Login again.");
        await logOut();
        return;
      }

      const { fire_level, total_damage } = res.data;
      const formattedValue = Math.round(total_damage).toLocaleString();

      setFireLevel(fire_level);
      setTotalCost(formattedValue);
    } catch (error) {
      console.error("Error during prediction:", error);
      alert("An error occurred while predicting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handler to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle the location selection from the map modal
  const handleLocationSelect = ({ lat, lng, address }) => {
    setLocation({ lat, lng });
    setAddress(address);
    closeModal(); // Close modal after selecting the location
  };

  // Toggle the visibility of the summary when the icon is clicked
  const handleInfoClick = () => {
    setShowSummary(!showSummary);
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
          <div className="w-full flex lg:text-xl text-xs font-semibold px-5 justify-center items-center text-center text-black mt-5">
            Predicting fire level and damage cost in your neighborhood
            <FaInfoCircle
              className="ml-2 text-slate-600 hover:text-black"
              onClick={handleInfoClick}
            />
          </div>
          {showSummary && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
              onClick={() => setShowSummary(false)}
            >
              <div className="bg-white p-6 w-11/12 md:w-8/12 lg:w-6/12 rounded-lg shadow-lg">
                <h3 className="font-semibold text-xl mb-3">Summary:</h3>
                <p className="text-sm text-gray-700">
                  The project focuses on the development of a web application
                  that predicts potential fire damage costs based on weather
                  conditions and historical data. By integrating real-time
                  weather information with past fire incident records, the app
                  provides estimations of potential damage from fires. The model
                  uses machine learning to analyze patterns and factors that
                  contribute to fire severity, offering a predictive tool that
                  can assist in fire risk assessment and cost forecasting.
                </p>

                <h3 className="font-semibold text-xl mt-3">Why It Was Made:</h3>
                <p className="text-sm text-gray-700">
                  This web app was created to address the growing concern over
                  fire-related damages and to improve preparedness. By
                  leveraging weather data and historical fire records, the
                  application provides a valuable resource for predicting fire
                  damage, enabling better planning, resource allocation, and
                  risk management for both individuals and local authorities. It
                  aims to enhance safety measures, minimize financial losses,
                  and help communities respond more effectively to fire risks.
                </p>
              </div>
            </div>
          )}
          {/* Display Address */}
          <div className="w-full text-center font-semibold mt-4">
            {address ? (
              <div className="w-full text-center font-semibold mt-4">
                <div className="bg-white border border-y-[#d10606] w-full p-4 mt-3 flex items-center justify-center">
                  <span className="mr-2">{address}</span>
                  <FaMapMarkerAlt
                    className="text-lg text-[#d10606] hover:text-[#d10606]/50"
                    onClick={openModal}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full text-center font-semibold mt-4">
                <div className="bg-white border border-y-[#d10606] w-full p-4 mt-3 flex items-center justify-center">
                  <span className="mr-2">
                    No address found. Turn on Location
                  </span>
                  <FaMapMarkerAlt
                    className="text-lg text-[#d10606] hover:text-[#d10606]/50"
                    onClick={openModal}
                  />
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
                  value={temperature} // Use temperature state if available, otherwise fallback to weatherData.main.temp
                  onChange={(e) => setTemperature(e.target.value)}
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
                  value={humidity} // Use humidity state if available, otherwise fallback to weatherData.main.humidity
                  onChange={(e) => setHumidity(e.target.value)}
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
                  value={pressure} // Use pressure state if available, otherwise fallback to weatherData.main.pressure
                  onChange={(e) => setPressure(e.target.value)}
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
                  value={wind} // Use wind state if available, otherwise fallback to weatherData.wind.speed
                  onChange={(e) => setWind(e.target.value)}
                />
                {"m/s"}
              </div>
            </div>
          </div>

          <div className="w-full h-auto flex flex-col md:flex-row items-center justify-center gap-5 px-12 md:px-32 mt-6">
            <div className="w-full flex-col ">
              <div className="font-bold">Possible Fire Level</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                <MdOutlineLocalFireDepartment className="text-xl" />
                <span className="flex-1 text-center">
                  {fireLevel ? fireLevel : "Possible Fire Level"}
                </span>{" "}
              </div>
            </div>
            <div className="w-full flex-col">
              <div className="font-bold">Possible Fire Damage Cost</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                <FaPesoSign className="text-sm" />
                <span className="flex-1 text-center">
                  {`${
                    totalCost ? `₱${totalCost}` : "Possible Fire Damage Cost"
                  }`}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center w-full h-auto mt-6 gap-6 md:gap-14 pb-5">
            <button
              className={`w-auto flex flex-row items-center justify-center text-lg font-semibold rounded-lg px-12 py-3 
              text-white bg-[#d10606] border-2 border-[#d10606] 
              ${
                loading
                  ? "cursor-not-allowed opacity-50"
                  : "hover:text-[#b00505] hover:border-[#b00505] hover:bg-white"
              }`}
              onClick={loading ? null : handlePrediction}
              disabled={loading}
              aria-label="Predict fire level and total damage"
            >
              {loading ? "Loading..." : "PREDICT"}
            </button>
          </div>
          {/* Map Picker Modal */}
          <MapPickerModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onLocationSelect={handleLocationSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;

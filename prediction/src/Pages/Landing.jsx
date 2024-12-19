import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../Components/NavBar";
import Report from "../Components/Report";
import Captcha from "../Components/Captcha";
import { useAuth } from "../AuthProvider/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { TbTemperature } from "react-icons/tb";
import { TiWeatherCloudy, TiWeatherWindy } from "react-icons/ti";
import { WiHumidity } from "react-icons/wi";
import { MdCompress, MdOutlineLocalFireDepartment } from "react-icons/md";
import { FaPesoSign } from "react-icons/fa6";
import { PiTarget } from "react-icons/pi";

const Landing = () => {
  const [showReport, setShowReport] = useState(false);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Correctly reference your API key
  const [location, setLocation] = useState({
    // lat: 14.9767, // Default fallback coordinates (e.g., UCC South Campus)
    // lng: 120.9705,
  });
  const [address, setAddress] = useState(""); // New state to store the address
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fireLevel, setFireLevel] = useState(null);
  const [totalCost, setTotalCost] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false); // Control prediction visibility
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);

  const toggleReport = () => setShowReport(!showReport);
  const { user, token, logOut } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);
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
  // console.log("location", location);

  const handlePrediction = async () => {
    try {
      if (!weatherData) {
        alert("Weather Data is Unavailable!");
        return;
      }
      setLoading(true);
      const temperature = weatherData.main.temp; // °C
      const barometer = weatherData.main.pressure; // hPa
      const wind = weatherData.wind.speed; // m/s
      const cloudiness = weatherData.clouds?.all || 0; // % cloud cover

      const weatherDescription =
        weatherData.weather[0]?.description.toLowerCase();
      const precipitation = weatherDescription.includes("rain") ? 1 : 0;

      // Example season logic (adjust as needed)
      const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed
      const seasonSummer = currentMonth >= 3 && currentMonth <= 5 ? 1 : 0;
      const seasonWet = currentMonth >= 6 && currentMonth <= 11 ? 1 : 0;
      const seasonDry = currentMonth === 12 || currentMonth <= 2 ? 1 : 0;

      // Define weather-specific features
      const weatherHaze = weatherDescription.includes("haze") ? 1 : 0;
      const weatherOvercast = weatherDescription.includes("overcast clouds")
        ? 1
        : 0;
      const passingClouds = cloudiness >= 25 && cloudiness < 50 ? 1 : 0;
      const scatteredClouds = cloudiness >= 50 && cloudiness < 75 ? 1 : 0;

      const payload = {
        Temperature: temperature,
        Wind: wind,
        Precipitation: precipitation,
        Barometer: barometer,
        Weather_Haze: weatherHaze,
        Passing_clouds: passingClouds,
        Scattered_clouds: scatteredClouds,
        Season_Dry: seasonDry,
        Season_Summer: seasonSummer,
        Season_Wet: seasonWet,
        Weather_Overcast: weatherOvercast,
        location: address,
      };
      // console.log("Payload: ", payload);
      const res = await api.post("/predict", payload);
      // const res1 = await api.get("/features");
      // console.log(res1);
      if (!res) {
        alert("Session Expired!");
        return;
      }
      if (res.data.error) {
        alert("Token Expired! Login again.");
        await logOut();
      }
      const { fire_level, total_damage } = res.data;
      const intValue = Math.round(total_damage);
      const formattedValue = intValue.toLocaleString();

      setFireLevel(fire_level);
      setTotalCost(formattedValue);
      setLoading(false);
      // setShowPrediction(true);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleModal = () => {
    setShowCaptchaModal(true);
  };

  const handleCaptchaVerification = (isVerified) => {
    setShowCaptchaModal(false);
    if (isVerified) {
      setShowPrediction(true);
      handlePrediction();
    }
  };

  // Close the disclaimer modal
  const handleCloseDisclaimer = () => {
    if (isChecked) {
      setShowDisclaimer(false);
    } else {
      alert("You must acknowledge the disclaimer to proceed.");
    }
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
        {showDisclaimer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto py-10">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-[90%] sm:w-[80%] md:w-[60%] max-w-3xl overflow-auto mt-24 md:mt-0">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-start mb-2">
                Disclaimer
              </h2>
              <p className="text-sm sm:text-base text-start mb-4">
                <br />
                The fire level and fire damage cost predictions provided on this
                website are estimates based on available data and predictive
                models. These predictions are not guaranteed to be accurate and
                should not be considered as definitive or final assessments.
                Actual fire conditions, severity, and associated costs may vary
                based on numerous factors, including but not limited to weather,
                location, and unforeseen circumstances.
                <br />
                Please note that in order to generate these predictions, the
                website requires your location. The accuracy of the prediction
                may be influenced by the information you provide.
                <br />
                Always consult with local authorities, fire safety experts, or
                insurance providers for more accurate and comprehensive
                assessments.
              </p>
              <div className="flex justify-center items-center mb-4">
                <input
                  type="checkbox"
                  id="acknowledge"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  className="mr-2"
                />
                <label htmlFor="acknowledge" className="text-sm sm:text-base">
                  I acknowledge the disclaimer.
                </label>
              </div>
              <button
                onClick={handleCloseDisclaimer}
                disabled={!isChecked}
                className={`p-3 mt-5 font-semibold rounded-md w-full ${
                  isChecked ? "bg-red-500 text-white" : "bg-gray-400"
                }`}
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}
        <NavBar />
        <div className="flex flex-col items-center justify-start w-full h-full mt-[14vh]">
          <div className="md:text-5xl text-4xl font-extrabold text-center italic text-black mb-2">
            How Much Will Fire Cost Your Neighborhood?
          </div>
          <div className="w-full flex lg:text-xl text-xs font-semibold px-5 justify-center items-center text-center text-black mt-5">
            Predicting fire level and damage cost in your neighborhood
          </div>

          {/* Display Address */}
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

          {/* Display the weather data if available */}
          {loading && <div>Loading weather data...</div>}
          {error && <div>{error}</div>}
          {weatherData ? (
            <div className="w-full h-auto flex flex-col md:flex-row items-center justify-center gap-5 px-12 md:px-32 mt-8">
              <div className="w-full flex-col">
                <div className="font-bold">Temperature</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                  <TbTemperature className="text-xl" />
                  <span className="flex-1 text-center">
                    {weatherData.main.temp}°C
                  </span>{" "}
                </div>
              </div>

              <div className="w-full flex-col ">
                <div className="font-bold">Weather</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                  <TiWeatherCloudy className="text-xl" />
                  <span className="flex-1 text-center">
                    {weatherData.weather[0].description}
                  </span>{" "}
                </div>
              </div>
              <div className="w-full flex-col ">
                <div className="font-bold">Humidity</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                  <WiHumidity className="text-xl" />
                  <span className="flex-1 text-center">
                    {weatherData.main.humidity}%
                  </span>{" "}
                </div>
              </div>
              <div className="w-full flex-col ">
                <div className="font-bold">Pressure</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                  <MdCompress className="text-xl" />
                  <span className="flex-1 text-center">
                    {weatherData.main.pressure} hPa
                  </span>{" "}
                </div>
              </div>
              <div className="w-full flex-col ">
                <div className="font-bold">Wind Speed</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                  <TiWeatherWindy className="text-xl" />
                  <span className="flex-1 text-center">
                    {weatherData.wind.speed} m/s
                  </span>{" "}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full text-center mt-8">
              <div className="bg-white border border-[#d10606] w-full p-4 text-center font-semibold ">
                Weather data is unavailable. Please try again later.
              </div>
            </div>
          )}

          {/* Prediction Section */}
          {showPrediction && (
            <div className="w-full h-auto flex flex-col md:flex-row items-center justify-center gap-5 px-12 md:px-32 mt-8">
{/*               <div className="w-full flex-col ">
                <div className="font-bold">Accuracy</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                  <PiTarget className="text-xl" />
                  <span className="flex-1 text-center">{"90%"}</span>{" "}
                </div>
              </div> */}
              <div className="w-full flex-col ">
                <div className="font-bold">Possible Fire Level</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                  <MdOutlineLocalFireDepartment className="text-xl" />
                  <span className="flex-1 text-center">
                    {fireLevel || "Loading..."}
                  </span>{" "}
                </div>
              </div>
              <div className="w-full flex-col">
                <div className="font-bold">Possible Fire Damage Cost</div>
                <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold flex items-center justify-between">
                  <FaPesoSign className="text-sm" />
                  <span className="flex-1 text-center">
                    {totalCost || "Loading..."}
                  </span>{" "}
                </div>
              </div>
            </div>
          )}

          {/* CAPTCHA Modal */}
          {showCaptchaModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <Captcha onVerify={handleCaptchaVerification} />
              </div>
            </div>
          )}
          <div className="flex flex-col md:flex-row justify-center items-center w-full h-auto mt-8 gap-6 md:gap-14 pb-5">
            <button
              className="w-auto flex flex-row items-center justify-center text-lg font-semibold rounded-lg px-12 py-3 text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white"
              onClick={() => handleModal()}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner-border animate-spin border-4 border-t-4 border-white w-5 h-5 rounded-full"></div>
              ) : (
                "PREDICT"
              )}
            </button>
          </div>
        </div>
      </div>
      <Report isVisible={showReport} onClose={toggleReport} />
    </div>
  );
};

export default Landing;

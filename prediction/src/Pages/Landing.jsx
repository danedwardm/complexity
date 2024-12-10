import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../Components/NavBar";
import Report from "../Components/Report";

const Landing = () => {
  const [showReport, setShowReport] = useState(false);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; // Correctly reference your API key
  const [location, setLocation] = useState({
    lat: 14.9767, // Default fallback coordinates (e.g., UCC South Campus)
    lng: 120.9705,
  });
  const [address, setAddress] = useState(""); // New state to store the address
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fireLevel, setFireLevel] = useState(null)
  const [totalCost, setTotalCost] = useState(null)
  const toggleReport = () => setShowReport(!showReport);

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
    const GEOCODE_API_URL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  
    try {
      const response = await axios.get(GEOCODE_API_URL);
      console.log(response.data); // Log the API response to inspect the structure
  
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
  console.log("location", location);

  const handlePrediction = async () => {
      try {
         // "Temperature": 30.5,
        // "Wind": 15.0,
        // "Precipitation": 10.0,
        // "Barometer": 1012.0,
        // "Weather_Haze": 1,
        // "Passing_clouds": 0,
        // "Scattered_clouds": 1,
        // "Season_Dry": 0,
        // "Season_Summer": 1,
        // "Season_Wet": 0,
        // "Weather_Overcast": 0
        if(!weatherData){
          alert("Weather Data is Unavailable!")
            return;
        }
        const temperature = weatherData.main.temp; // °C
        const barometer = weatherData.main.pressure; // hPa
        const wind = weatherData.wind.speed; // m/s
        const cloudiness = weatherData.clouds?.all || 0; // % cloud cover
    
        const weatherDescription = weatherData.weather[0]?.description.toLowerCase();
        const precipitation = weatherDescription.includes("rain") ? 1 : 0;
    
        // Example season logic (adjust as needed)
        const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed
        const seasonSummer = currentMonth >= 3 && currentMonth <= 5 ? 1 : 0; 
        const seasonWet = currentMonth >= 6 && currentMonth <= 11 ? 1 : 0; 
        const seasonDry = currentMonth === 12 || currentMonth <= 2 ? 1 : 0;
    
        // Define weather-specific features
        const weatherHaze = weatherDescription.includes("haze") ? 1 : 0;
        const weatherOvercast = weatherDescription.includes("overcast clouds") ? 1 : 0;
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
        };
        console.log("Payload: ", payload)
          const res = await axios.post('http://127.0.0.1:8000/predict', payload)
          if(!res){
            alert("Cannot predict at the moment.")
            return;
          }
          const { fire_level, total } = res.data
          const intValue = Math.round(total);
          const formattedValue = intValue.toLocaleString(); 

          setFireLevel(fire_level)
          setTotalCost(formattedValue)
      } catch (error) {
          console.error(error)
      }
  }
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
                {fireLevel ? fireLevel : "Fire Level Prediction"}
              </div>
            </div>
            <div className="w-full flex-col md:ml-5">
              <div className="font-bold">Fire Damage Cost</div>
              <div className="bg-white border border-[#d10606] w-full rounded-md p-4 mt-3 text-center font-semibold">
                {totalCost ? totalCost :"Fire Damage Cost Prediction"}
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center w-full h-auto mt-8 gap-6 md:gap-14 pb-10">
            <button className="w-auto flex flex-row items-center justify-center text-lg font-semibold rounded-lg px-12 py-3 text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white" onClick={() => handlePrediction()}>
              PREDICT
            </button>
            <button
              onClick={toggleReport}
              className="w-auto flex flex-row items-center justify-center text-lg font-semibold rounded-lg px-8 py-3 text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white"
            >
              REPORT FIRE
            </button>
          </div>
        </div>
      </div>
      <Report isVisible={showReport} onClose={toggleReport} />
    </div>
  );
};

export default Landing;

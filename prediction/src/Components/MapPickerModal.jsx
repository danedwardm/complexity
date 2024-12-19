import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css"; // Import leaflet styles

const MapPickerModal = ({ isOpen, onClose, onLocationSelect }) => {
  const [location, setLocation] = useState({ lat: 0, lng: 0 }); // Default location
  const [address, setAddress] = useState("");

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
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Fetch address based on latitude and longitude
  const fetchAddress = async (lat, lng) => {
    const GEOCODE_API_URL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    try {
      const response = await axios.get(GEOCODE_API_URL);
      if (response.data && response.data.display_name) {
        setAddress(response.data.display_name);
      } else {
        setAddress("Address not found");
      }
    } catch (err) {
      console.error("Error fetching address:", err);
      setAddress("Error fetching address");
    }
  };

  // Handle map click event
  const LocationPicker = () => {
    useMapEvents({
      click(event) {
        const { lat, lng } = event.latlng;
        setLocation({ lat, lng });
        fetchAddress(lat, lng);
        onLocationSelect({ lat, lng, address }); // Pass selected location to parent
      },
    });
    return null;
  };

  useEffect(() => {
    fetchAddress(location.lat, location.lng); // Fetch address initially
  }, [location]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-[80%] md:w-[600px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Select Location</h2>
          <button
            onClick={onClose}
            className="text-lg font-bold text-[#d10606] hover:text-red-500"
          >
            X
          </button>
        </div>
        <div className="mb-4">Click on the map to select a location</div>
        <div className="w-full h-[400px]">
          <MapContainer
            center={location}
            zoom={13}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationPicker />
            <Marker position={location}>
              <Popup>{address}</Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="bg-[#d10606] text-white px-4 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;

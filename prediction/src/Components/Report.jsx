import React, { useState } from "react";
import { LuMapPin, LuThermometer, LuClock } from "react-icons/lu";

const Report = ({ isVisible, onClose }) => {
  // Destructure props
  const [location, setLocation] = useState("");
  const [timeFireStarted, setTimeFireStarted] = useState("");
  const [timeFireOut, setTimeFireOut] = useState("");
  const [fireLevel, setFireLevel] = useState("");

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const currentDateTime = new Date();
    const formattedDateTime = currentDateTime.toISOString();

    // Here you can send the data to your server or perform other logic
    console.log("Report Details ", {
      location,
      timeFireStarted,
      timeFireOut,
      fireLevel,
      dateTime: formattedDateTime,
    });

    // Clear the form inputs
    setLocation("");
    setTimeFireStarted("");
    setTimeFireOut("");
    setFireLevel("");

    // Close the modal after submitting
    onClose();
  };

  if (!isVisible) return null; // Do not render anything if the modal is not visible

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white border border-[#d10606] w-11/12 md:w-1/2 lg:w-1/3 p-12 rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
      >
        <div className="text-center text-2xl font-extrabold text-[#d10606] mb-4">
          Fire Estimate Form
        </div>
        <form onSubmit={handleSubmit}>
          {/* Location Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              <LuMapPin className="text-[#d10606] text-lg" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full outline-none text-sm text-gray-700 px-2"
                placeholder="Enter the location"
                required
              />
            </div>
          </div>

          {/* Estimate Time Fire Started Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimate Time Fire Started
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              <LuClock className="text-[#d10606] text-lg" />
              <input
                type="time"
                value={timeFireStarted}
                onChange={(e) => setTimeFireStarted(e.target.value)}
                className="w-full outline-none text-sm text-gray-700 px-2"
                required
              />
            </div>
          </div>

          {/* Estimate Time Fire Out Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimate Time Fire Out
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              <LuClock className="text-[#d10606] text-lg" />
              <input
                type="time"
                value={timeFireOut}
                onChange={(e) => setTimeFireOut(e.target.value)}
                className="w-full outline-none text-sm text-gray-700 px-2"
                required
              />
            </div>
          </div>

          {/* Estimate Fire Level Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimate Fire Level
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              <LuThermometer className="text-[#d10606] text-lg" />
              <select
                value={fireLevel}
                onChange={(e) => setFireLevel(e.target.value)}
                className="w-full outline-none text-sm text-gray-700 px-2"
                required
              >
                <option value="">Select Fire Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6 gap-4">
            <button
              type="submit"
              className="font-bold text-md px-6 py-2 rounded-md text-white bg-[#d10606] border border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[#d10606] border border-[#d10606] font-bold text-md px-6 py-2 rounded-md hover:text-white hover:bg-[#b00505]"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Report;

// src/Components/ReviewModal.js
import React from "react";

const Review = ({ isVisible, onClose, reportData }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-[100svh] items-center justify-center bg-black/50 flex z-30 font-figtree">
      <div
        className="w-full min-h-[100svh] max-h-[100svh] py-12 px-4 overflow-auto flex justify-center items-start"
        onClick={onClose}
      >
        <div className="bg-white border border-[#d10606] w-11/12 md:w-1/2 lg:w-1/3 p-12 rounded-lg shadow-lg">
          <div className="text-center text-2xl font-extrabold text-[#d10606] mb-4">
            Report Details
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              {/* <LuMapPin className="text-[#d10606] text-lg" /> */}
              <input
                type="text"
                value={reportData.username}
                className="w-full outline-none text-sm text-gray-700 px-2"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Report Time
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              {/* <LuMapPin className="text-[#d10606] text-lg" /> */}
              <input
                type="text"
                value={reportData.report_date}
                className="w-full outline-none text-sm text-gray-700 px-2"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              {/* <LuMapPin className="text-[#d10606] text-lg" /> */}
              <input
                type="text"
                value={reportData.location}
                className="w-full outline-none text-sm text-gray-700 px-2"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Weather Condition
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              {/* <LuMapPin className="text-[#d10606] text-lg" /> */}
              <input
                type="text"
                value={reportData.weather_condition}
                className="w-full outline-none text-sm text-gray-700 px-2"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimated Time Fire Started
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              {/* <LuMapPin className="text-[#d10606] text-lg" /> */}
              <input
                type="text"
                value={reportData.estimated_time_fire_started}
                className="w-full outline-none text-sm text-gray-700 px-2"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimated Time Fire Out
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              {/* <LuMapPin className="text-[#d10606] text-lg" /> */}
              <input
                type="text"
                value={reportData.estimated_time_fire_out}
                className="w-full outline-none text-sm text-gray-700 px-2"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Is Validated
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              {/* <LuMapPin className="text-[#d10606] text-lg" /> */}
              <input
                type="text"
                value={reportData.is_validated}
                className="w-full outline-none text-sm text-gray-700 px-2 uppercase"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estimated Fire Level
            </label>
            <div className="flex items-center border border-[#d10606] rounded-md px-3 py-2">
              {/* <LuMapPin className="text-[#d10606] text-lg" /> */}
              <input
                type="text"
                value={reportData.estimated_fire_level}
                className="w-full outline-none text-sm text-gray-700 px-2 uppercase"
              />
            </div>
          </div>
          <div className="flex justify-end mt-8 gap-5">
            <button
              //   onClick={onClose}
              className="px-6 py-1 rounded-md text-md text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white"
            >
              Validate
            </button>
            <button
              //   onClick={onClose}
              className="px-6 py-1 rounded-md text-md text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="px-6 py-1 rounded-md text-md text-white bg-[#d10606] border-2 border-[#d10606] hover:text-[#b00505] hover:border-[#b00505] hover:bg-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;

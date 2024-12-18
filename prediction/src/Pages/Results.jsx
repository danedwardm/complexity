import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../api/axiosInstance";
import NavBar from "../Components/NavBar";
import Report from "../Components/Report";
import ReviewModal from "../Components/Review";
import currentData from "../Components/Data.json"; // The imported report data
import { FaFire, FaAngleLeft, FaAngleRight } from "react-icons/fa";

const Results = () => {
  const [showReport, setShowReport] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [featuresData, setFeaturesData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  const toggleReport = () => setShowReport(!showReport);
  const closeModal = () => setShowReview(!showReview);

  // Pagination logic
  const totalItems = featuresData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Slice the data based on the current page
  const currentReports = featuresData.slice(indexOfFirstItem, indexOfLastItem);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/features"); // Fetch features data
        setFeaturesData(res.data); // Store features data
        console.log(featuresData); // Log to check the fetched data
      } catch (error) {
        console.error("Fetching workers error: ", error);
      }
    };
    fetchData();
  }, []);

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
            Previous predictions submitted by users
          </div>

          {/* Report Cards Section */}
          <div className="bg-white border-2 border-[#d10606] flex flex-col rounded-lg antialiased w-[90vw] mx-8 mt-6">
            {/* header */}
            <div className="flex flex-row justify-between bg-[#d10606]">
              <div className="flex justify-center items-center py-3 px-8">
                <p className="text-white font-semibold text-sm">reports</p>
              </div>
            </div>
            <div className="overflow-x-auto px-5 py-6">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Location
                    </th>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Weather Condition
                    </th>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Season
                    </th>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Temperature
                    </th>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Humidity
                    </th>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Pressure
                    </th>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Wind Speed
                    </th>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Fire Level
                    </th>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Fire Damage Cost
                    </th>
                    <th className="px-4 py-2 font-semibold text-sm border-b border-[#d10606] text-start p-3 truncate">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentReports.map((data, index) => {
                    const reportDate = new Date(data.report_date);
                    const formattedDate = reportDate.toLocaleDateString();
                    const formattedTime = reportDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={index} className="bg-[#FAF5FF]">
                        <td className="px-4 py-2 border-b">
                          <p className="w-full truncate text-sm ">
                            {data.location
                              ? data.location.length > 20
                                ? `${data.location.substring(0, 20)}...`
                                : data.location
                              : "No Location"}
                          </p>
                        </td>
                        <td className="px-4 py-2 border-b ">
                          <p className="w-full truncate text-sm">
                            {
                              // Check for truthy and non-zero weather conditions
                              data.Weather_Haze ||
                              data.Passing_clouds ||
                              data.Scattered_clouds ||
                              data.Weather_Overcast ? (
                                <>
                                  {!!data.Weather_Haze && <span>Haze </span>}
                                  {!!data.Passing_clouds && (
                                    <span>Passing Clouds </span>
                                  )}
                                  {!!data.Scattered_clouds && (
                                    <span>Scattered Clouds </span>
                                  )}
                                  {!!data.Weather_Overcast && (
                                    <span>Overcast</span>
                                  )}
                                </>
                              ) : (
                                "No Weather"
                              )
                            }
                          </p>
                        </td>
                        <td className="px-4 py-2 border-b">
                          <p className="w-full truncate text-sm">
                            {
                              // Check for truthy and non-zero weather conditions
                              data.Season_Dry ||
                              data.Season_Summer ||
                              data.Season_Wet ? (
                                <>
                                  {!!data.Season_Dry && <span>Dry </span>}
                                  {!!data.Season_Summer && <span>Summer </span>}
                                  {!!data.Season_Wet && <span>Wet </span>}
                                </>
                              ) : (
                                "No Season"
                              )
                            }
                          </p>
                        </td>
                        <td className="px-4 py-2 border-b">
                          <p className="w-full truncate text-sm">
                            {data.Temperature}°C,{" "}
                          </p>
                        </td>
                        <td className="px-4 py-2 border-b">
                          <p className="w-full truncate">
                            {data.Precipitation}%,{" "}
                          </p>
                        </td>
                        <td className="px-4 py-2 border-b">
                          <p className="w-full truncate text-sm">
                            {data.Barometer} hPA,{" "}
                          </p>
                        </td>
                        <td className="px-4 py-2 border-b">
                          <p className="w-full truncate text-sm">
                            {data.Wind} m/s,{" "}
                          </p>
                        </td>
                        <td className="px-4 py-2 border-b">
                          <p
                            className={`font-bold w-full truncate text-sm ${
                              data.Fire_Level
                                ? "text-[#007a3f]"
                                : "text-[#a10b00]"
                            }`}
                          >
                            {data.Fire_Level ? "LOW" : "HIGH"}
                          </p>
                        </td>
                        <td className="px-4 py-2 border-b">
                          <p className="w-full truncate text-sm">
                            Php {Math.round(data.Total_Damage).toLocaleString()}
                          </p>
                        </td>
                        <td className="px-4 py-2 border-b">
                          <p className="w-full truncate text-sm">{`${formattedDate} ${formattedTime}`}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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

export default Results;

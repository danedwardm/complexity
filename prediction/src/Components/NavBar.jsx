import React, { useEffect, useState } from "react";

// import Profile from "../../../Components/Modals/Profile";

import logo from "../assets/fireWhite.png";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdNotificationsActive } from "react-icons/md";
import { useAuth } from "../AuthProvider/AuthContext";

const NavBar = () => {
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const { token, user, logOut } = useAuth();

  return (
    <>
      <div className="fixed w-full px-8 font-dm z-30">
        <div className="py-4 px-6 bg-[#d10606] flex justify-between items-center rounded-b-lg">
          <div className="flex justify-center items-center gap-2">
            <img src={logo} alt="/" className="w-[30px]" />
            <p className="hidden md:block font-semibold text-sm uppercase text-white">
              Fire Cost Prediction
            </p>
            <p className="block md:hidden font-extrabold text-sm uppercase text-white">
              Fire Cost Prediction
            </p>
          </div>
          {/* Menu dropdown */}
          <div className="relative flex gap-2">
            <div className="flex items-center justify-center">
              <p className="hidden md:block font-semibold text-sm uppercase text-white">
                {user}
              </p>
            </div>
            <div
              className="rounded-full bg-white w-[35px] h-[35px] flex items-center justify-center cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}
            >
              <FaUser className="text-[#d10606] text-lg" />
            </div>

            {showProfile && (
              <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg border w-[150px]">
                <ul className="flex flex-col">
                  <li>
                    <div
                      className="block px-4 py-2 font-bold text-textSecond hover:text-[#d10606] cursor-pointer"
                      onClick={() => navigate("/")}
                    >
                      Home
                    </div>
                    <hr className="h-px px-2 bg-gray-200 border-0 dark:bg-gray-200"></hr>
                  </li>
                  <li>
                    <div
                      className="block px-4 py-2 font-bold text-textSecond hover:text-[#d10606] cursor-pointer"
                      onClick={() => navigate("/test")}
                    >
                      Test Page
                    </div>
                    <hr className="h-px px-2 bg-gray-200 border-0 dark:bg-gray-200"></hr>
                  </li>
                  <li>
                    <div
                      className="block px-4 py-2 font-bold text-textSecond hover:text-[#d10606] cursor-pointer"
                      onClick={() => navigate("/results")}
                    >
                      Results
                    </div>
                    <hr className="h-px px-2 bg-gray-200 border-0 dark:bg-gray-200"></hr>
                  </li>
                  <li>
                    <div
                      className="block px-4 py-2 font-bold text-textSecond hover:text-[#d10606] cursor-pointer"
                      onClick={() => navigate("/analysis")}
                    >
                      Analysis
                    </div>
                    <hr className="h-px px-2 bg-gray-200 border-0 dark:bg-gray-200"></hr>
                  </li>
                  {!token && (
                    <li>
                      <div
                        onClick={() => navigate("/login")} // Handle the navigation on click
                        className="block px-4 py-2 font-bold text-textSecond hover:text-[#d10606] cursor-pointer"
                      >
                        Login
                      </div>
                    </li>
                  )}
                  <li>
                    <div
                      onClick={async () => await logOut()} // Handle the navigation on click
                      className="block px-4 py-2 font-bold text-textSecond hover:text-[#d10606] cursor-pointer"
                    >
                      Logout
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* <Profile isVisible={showProfile} onClose={() => setShowProfile(false)} /> */}
    </>
  );
};

export default NavBar;

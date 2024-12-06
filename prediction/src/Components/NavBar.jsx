import React, { useEffect, useState } from "react";

// import Profile from "../../../Components/Modals/Profile";

import logo from "../assets/fireWhite.png";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdNotificationsActive } from "react-icons/md";

const NavBar = () => {
  const [toggleNotifsOpen, setIsNotifsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notification, setNotification] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // const fetchNotification = async () => {
    //   console.log("Fetching notifications");
    //   const notificationRef = collection(db, "notifications");
    //   // Listen to changes in the 'notifications' collection
    //   const unsubscribe = onSnapshot(
    //     notificationRef,
    //     (querySnapshot) => {
    //       const notifications = querySnapshot.docs
    //         .filter(
    //           (doc) => doc.data() && doc.data().hasOwnProperty("for_superadmin")
    //         )
    //         .map((doc) => {
    //           return { id: doc.id, ...doc.data() };
    //         });
    //       console.log("Fetching...", notifications);
    //       setNotification(notifications);
    //     },
    //     (error) => {
    //       console.error("Error fetching verification info:", error);
    //     }
    //   );
    //   return () => unsubscribe();
    // };
    // fetchNotification();
  }, []);

  return (
    <>
      <div className="fixed w-full px-8 font-dm z-30">
        <div className="py-4 px-6 bg-[#d10606] flex justify-between items-center rounded-b-lg">
          <div className="flex justify-center items-center gap-2">
            <img src={logo} alt="/" className="w-[30px]" />
            <p className="hidden md:block font-semibold text-sm uppercase text-second">
              Fire Prediction
            </p>
            <p className="block md:hidden font-extrabold text-sm uppercase text-second">
              CRISP
            </p>
          </div>
          {/* Menu dropdown */}
          <div className="relative flex gap-2">
            {/* <div className="flex items-center justify-center">
              <p className="hidden md:block font-semibold text-sm uppercase text-second">
                Super Admin
              </p>
            </div> */}
            <div
              className="flex items-center justify-center cursor-pointer px-2"
              onClick={() => setIsNotifsOpen(!toggleNotifsOpen)}
            >
              <MdNotificationsActive className="text-white text-3xl" />
              <div className="absolute top-0 right-12 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <div
              className="rounded-full bg-white w-[35px] h-[35px] flex items-center justify-center cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}
            >
              <FaUser className="text-[#d10606] text-lg" />
            </div>
            {toggleNotifsOpen && (
              <div className="absolute top-full right-12 mt-2 bg-white shadow-lg rounded-lg border w-80">
                <ul className="flex flex-col">
                  <li>
                    <div className="block px-4 py-2 font-bold text-red-600">
                      Notifications
                    </div>
                    <hr className="h-px px-2 bg-gray-200 border-0 dark:bg-gray-200" />
                  </li>
                </ul>
              </div>
            )}

            {showProfile && (
              <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg border w-auto">
                <ul className="flex flex-col">
                  {/* <li>
                    <div className="block px-4 py-2 font-bold text-textSecond hover:text-main">
                      Profile
                    </div>
                    <hr className="h-px px-2 bg-gray-200 border-0 dark:bg-gray-200"></hr>
                  </li> */}
                  <li>
                    <div
                      onClick={() => navigate("/login")} // Handle the navigation on click
                      className="block px-4 py-2 font-bold text-textSecond hover:text-[#d10606] cursor-pointer"
                    >
                      Login
                    </div>
                  </li>
                  <li>
                    <div
                      onClick={() => navigate("/")} // Handle the navigation on click
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

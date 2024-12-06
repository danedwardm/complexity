import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LuUser, LuKey, LuEye, LuEyeOff, LuMapPin } from "react-icons/lu";
// import axiosInstance from "../axios-instance"; // Ensure this imports your configured axios instance
// import { useAuth } from "../AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../assets/fire.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // State to toggle between login and register

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };
  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible((prev) => !prev);
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation for the email
    if (!isValidEmail(email)) {
      setErrors("Please enter a valid email address.");
      setIsLoading(false);
      setTimeout(() => setErrors(""), 3000);
      return;
    }

    // Handle login or register logic based on isRegistering
    try {
      if (isRegistering) {
        // Handle Register logic here
        console.log("Registering user...");
        // Your registration logic here
      } else {
        // Handle Login logic here
        console.log("Logging in...");
        // Your login logic here (using email and password)
      }
      navigate("/"); // After login/registration, navigate to the dashboard or any relevant page
    } catch (error) {
      setErrorMessage("Operation failed. Please try again.");
    } finally {
      setIsLoading(false);
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
      {/* page */}
      <div className="relative h-[100vh] w-[100vw] flex flex-col md:flex-row gap-4 md:gap-6 justify-items-center items-center z-20 overflow-auto">
        {/* logo and title */}
        <div className="relative flex flex-col justify-center items-center w-full h-auto">
          <img
            src={logo}
            alt="logo"
            className="md:h-[35vh] md:w-[35vh] h-[20vh] w-[20vh] md:mt-0 mt-20 mb-7"
          />
          <div className="w-full flex md:text-4xl text-3xl font-extrabold px-5 justify-center text-center items-center text-[#d10606] mb-5">
            How Much Will Fire Cost Your Neighborhood?
          </div>
          <div className="w-full flex lg:text-xl text-xs font-semibold px-5 justify-center items-center text-center text-[#d10606] ">
            Predicting fire level and damage cost in your neighborhood
          </div>
        </div>

        {/* login/register form */}
        <div className="relative w-full h-auto flex flex-col justify-center items-center md:mt-0 mt-14 md:mb-0 mb-14">
          <div
            className={`bg-[#f9e7e7] h-auto w-full lg:w-1/2 md:w-auto ${
              isRegistering ? "py-6 px-9" : "p-9"
            } rounded-[10px] border border-[#d10606]`}
          >
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col justify-center items-center">
                <div className="md:text-2xl text-lg font-bold text-[#d10606] uppercase">
                  {isRegistering ? "Register" : "Welcome Back"}
                </div>
                <p className="text-xs md:mb-6 mb-4">
                  {isRegistering
                    ? "Create a new account"
                    : "Login to your account"}
                </p>
              </div>
              <div className="flex flex-col justify-center items-center w-full h-auto gap-3">
                {isRegistering ? (
                  <>
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-xs font-semibold px-1">Name</p>
                      <div className="py-3 px-4 bg-[#f6edff] border border-[#f85454] rounded-md flex flex-row w-full gap-3 items-center justify-center">
                        <LuUser className="text-md text-[#d10606]" />
                        <input
                          type="text"
                          placeholder="enter name"
                          className="text-xs w-full outline-none bg-[#f6edff] truncate"
                          role="presentation"
                          autoComplete="off"
                          onChange={(e) => setName(e.target.value)}
                          id="email-input"
                          value={name}
                        />
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-xs font-semibold px-1">Email</p>
                      <div className="py-3 px-4 bg-[#f6edff] border border-[#f85454] rounded-md flex flex-row w-full gap-3 items-center justify-center">
                        <LuUser className="text-md text-[#d10606]" />
                        <input
                          type="text"
                          placeholder="enter email"
                          className="text-xs w-full outline-none bg-[#f6edff] truncate"
                          role="presentation"
                          autoComplete="off"
                          onChange={(e) => setEmail(e.target.value)}
                          id="email-input"
                          value={email}
                        />
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-xs font-semibold px-1">Address</p>
                      <div className="py-3 px-4 bg-[#f6edff] border border-[#f85454] rounded-md flex flex-row w-full gap-3 items-center justify-center">
                        <LuMapPin className="text-md text-[#d10606]" />
                        <input
                          type="text"
                          placeholder="enter address"
                          className="text-xs w-full outline-none bg-[#f6edff] truncate"
                          role="presentation"
                          autoComplete="off"
                          onChange={(e) => setAddress(e.target.value)}
                          id="email-input"
                          value={address}
                        />
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-xs font-semibold px-1">Password</p>
                      <div className="py-3 px-4 bg-[#f6edff] border border-[#f85454] rounded-md flex flex-row w-full gap-3 items-center justify-center">
                        <LuKey className="text-md text-[#d10606]" />
                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          placeholder="enter password"
                          className="text-xs w-full outline-none bg-[#f6edff] truncate"
                          role="presentation"
                          autoComplete="off"
                          onChange={(e) => setPassword(e.target.value)}
                          id="password-input"
                          value={password}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                        >
                          {isPasswordVisible ? (
                            <LuEyeOff className="text-md text-[#d10606]" />
                          ) : (
                            <LuEye className="text-md text-[#d10606]" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-xs font-semibold px-1">
                        Confirm Password
                      </p>
                      <div className="py-3 px-4 bg-[#f6edff] border border-[#f85454] rounded-md flex flex-row w-full gap-3 items-center justify-center">
                        <LuKey className="text-md text-[#d10606]" />
                        <input
                          type={isConfirmPasswordVisible ? "text" : "password"}
                          placeholder="confirm password"
                          className="text-xs w-full outline-none bg-[#f6edff] truncate"
                          role="presentation"
                          autoComplete="off"
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          id="password-input"
                          value={confirmPassword}
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {isConfirmPasswordVisible ? (
                            <LuEyeOff className="text-md text-[#d10606]" />
                          ) : (
                            <LuEye className="text-md text-[#d10606]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-xs font-semibold px-1">Email</p>
                      <div className="py-3 px-4 bg-[#f6edff] border border-[#f85454] rounded-md flex flex-row w-full gap-3 items-center justify-center">
                        <LuUser className="text-md text-[#d10606]" />
                        <input
                          type="text"
                          placeholder="enter email"
                          className="text-xs w-full outline-none bg-[#f6edff] truncate"
                          role="presentation"
                          autoComplete="off"
                          onChange={(e) => setEmail(e.target.value)}
                          id="email-input"
                          value={email}
                        />
                      </div>
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <p className="text-xs font-semibold px-1">Password</p>
                      <div className="py-3 px-4 bg-[#f6edff] border border-[#f85454] rounded-md flex flex-row w-full gap-3 items-center justify-center">
                        <LuKey className="text-md text-[#d10606]" />
                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          placeholder="enter password"
                          className="text-xs w-full outline-none bg-[#f6edff] truncate"
                          role="presentation"
                          autoComplete="off"
                          onChange={(e) => setPassword(e.target.value)}
                          id="password-input"
                          value={password}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                        >
                          {isPasswordVisible ? (
                            <LuEyeOff className="text-md text-[#d10606]" />
                          ) : (
                            <LuEye className="text-md text-[#d10606]" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="w-full flex justify-end">
                      <Link
                        to="/forgot-password" // Adjust the path to your forgot password page
                        className="text-[#d10606] font-bold md:text-sm text-xs"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="w-full flex justify-start">
                    <p className="text-xs font-bold text-red-700">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <div className="flex w-full items-left justify-left flex-col">
                  {errors ? (
                    <p className="text-xs text-red-800 font-semibold flex text-left w-full mt-2">
                      {errors}
                    </p>
                  ) : null}
                </div>
                <div className="w-full flex items-end justify-end pt-3">
                  <button
                    type="submit"
                    className="text-xs font-semibold text-white bg-[#d10606] px-6 py-2 rounded-md hover:bg-textSecond ease-in-out duration-700 flex items-center justify-center"
                    disabled={isLoading} // Disable the button while loading
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 50 50"
                        stroke="currentColor"
                      >
                        <circle
                          cx="25"
                          cy="25"
                          r="20"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray="125" // This controls the length of the dash
                          strokeDashoffset="50" // This controls the offset for the dash, creating the "progress" effect
                          className="circle" // Apply rotation animation to this circle
                        />
                      </svg>
                    ) : null}
                    {isLoading ? null : (
                      <span>{isRegistering ? "Register" : "Login"}</span>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Toggle between Login and Register */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-[#d10606] font-semibold text-sm"
              >
                {isRegistering
                  ? "Already have an account? Login"
                  : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

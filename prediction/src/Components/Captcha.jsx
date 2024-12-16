import React, { useState, useEffect } from "react";

const generateCaptcha = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captcha;
};

const Captcha = ({ onVerify }) => {
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userInput, setUserInput] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    setCaptcha(generateCaptcha()); // Regenerate CAPTCHA every time the component mounts
  }, []);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttempted(true);

    // Check if the entered CAPTCHA is correct
    if (userInput === captcha) {
      setIsVerified(true);
      onVerify(true); // Pass the verification status to the parent
    } else {
      setIsVerified(false);
      setCaptcha(generateCaptcha()); // Generate a new CAPTCHA if the input is incorrect
      setUserInput(""); // Clear the input field
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold mb-3">Simple CAPTCHA</h3>
      <div className="text-2xl w-auto rounded font-bold text-main p-4 px-24 border border-[#d10606] mb-4 select-none ">
        {captcha}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center"
      >
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Enter CAPTCHA"
          className="py-3 px-12 text-center w-full border border-[#d10606] rounded-md mb-5"
        />
        <button
          type="submit"
          className="py-3 px-12 w-full bg-[#ff6363] text-white rounded-md hover:bg-[#d10606]"
        >
          Verify
        </button>
      </form>

      {attempted && (
        <div className="mt-2">
          {isVerified ? (
            <span className="text-green-500">Captcha Verified!</span>
          ) : (
            <span className="text-red-500">Incorrect Captcha, try again!</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Captcha;

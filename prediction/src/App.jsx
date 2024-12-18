import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Test from "./Pages/Test";
import Results from "./Pages/Results";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

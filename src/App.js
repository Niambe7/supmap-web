import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Map from "./pages/Map";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Map" element={<Map />} />
      </Routes>
    </div>
  );
}

export default App;

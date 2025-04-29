// App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Map from "./pages/Map";
import Register from "./pages/Register";
import TrafficAnalysis from "./pages/TrafficAnalysis";
import AdminRoute from "./components/AdminRoute"; // 👈 Import de la route admin
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/map" element={<Map />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route
          path="/trafficAnalysis"
          element={
            <AdminRoute>
              <TrafficAnalysis />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;

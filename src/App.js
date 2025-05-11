import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Map from "./pages/Map";
import Register from "./pages/Register";
import TrafficAnalysis from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import ForgotPassword from "./pages/ForgotPassword";

// Import de la fonction utilitaire
import { loadGoogleMaps } from "./utils/loadGoogleMaps";

function App() {
  useEffect(() => {
    const preloadGoogleMaps = async () => {
      try {
        const google = await loadGoogleMaps(
          process.env.REACT_APP_GOOGLE_MAPS_API_KEY
        );
        console.log("✅ Google Maps préchargé :", google);
      } catch (error) {
        console.error(
          "❌ Erreur lors du préchargement de Google Maps :",
          error
        );
      }
    };

    preloadGoogleMaps();
  }, []);

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

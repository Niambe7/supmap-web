import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Map from "./pages/Map";
import Register from "./pages/Register"; // Importer le composant Register

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/map" element={<Map />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;

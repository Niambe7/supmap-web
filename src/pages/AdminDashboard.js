import React, { useEffect, useState } from "react";
import {
  CongestionPeriods,
  IncidentsPerDay,
  PendingIncidents,
  ActiveIncidents,
  ResolvedIncidents,
} from "../components/AdminTabs";

import { motion, AnimatePresence } from "framer-motion";
import "../styles/AdminDashboard.css";

const tabs = [
  { label: "Congestion", key: "congestion" },
  { label: "Stats/Jour", key: "day" },
  { label: "À approuver", key: "pending" },
  { label: "Actifs", key: "active" },
  { label: "Résolus", key: "resolved" },
];

function AdminDashboard() {
  const [pendingIncidents, setPendingIncidents] = useState([]);
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [resolvedIncidents, setResolvedIncidents] = useState([]);
  const [incidentsPerDay, setIncidentsPerDay] = useState([]);
  const [searchZone, setSearchZone] = useState("");
  const [radius, setRadius] = useState(500);
  const [location, setLocation] = useState(null);
  const [congestionData, setCongestionData] = useState([]);
  const [currentTab, setCurrentTab] = useState("congestion");

  useEffect(() => {
    fetchPendingIncidents();
    fetchActiveIncidents();
    fetchResolvedIncidents();
    fetchIncidentsPerDay();
  }, []);

  const fetchPendingIncidents = async () => {
    const token = localStorage.getItem("token");
    if (!token) return console.error("Token manquant.");
    try {
      const res = await fetch(
        "https://api.supmap-server.pp.ua/incidents/incidents/getincdentpending",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setPendingIncidents(data.incidents);
    } catch (e) {
      console.error("Erreur incidents en attente :", e);
    }
  };

  const fetchActiveIncidents = async () => {
    const token = localStorage.getItem("token");
    if (!token) return console.error("Token manquant.");
    try {
      const res = await fetch(
        "https://api.supmap-server.pp.ua/incidents/incidents/getincdentactive",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setActiveIncidents(data.incidents);
    } catch (e) {
      console.error("Erreur incidents actifs :", e);
    }
  };

  const fetchResolvedIncidents = async () => {
    const token = localStorage.getItem("token");
    if (!token) return console.error("Token manquant.");
    try {
      const res = await fetch(
        "https://api.supmap-server.pp.ua/incidents/incidents/getincdentresolved",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setResolvedIncidents(data.incidents);
    } catch (e) {
      console.error("Erreur incidents résolus :", e);
    }
  };

  const fetchIncidentsPerDay = async () => {
    try {
      const res = await fetch(
        "https://api.supmap-server.pp.ua/statistics/incidents-per-day"
      );
      const data = await res.json();
      setIncidentsPerDay(data);
    } catch (e) {
      console.error("Erreur statistiques :", e);
    }
  };

  const handleSearch = async () => {
    if (!searchZone) return alert("Entrez une zone.");

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchZone
        )}`
      );
      const geoData = await geoRes.json();
      if (!geoData.length) return alert("Zone introuvable.");

      const { lat, lon } = geoData[0];
      setLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });

      const res = await fetch(
        "https://api.supmap-server.pp.ua/statistics/statistics/congestion-periods",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            radius: parseInt(radius),
          }),
        }
      );
      const data = await res.json();
      setCongestionData(data);
      if (data.length === 0) alert("Aucune donnée de congestion.");
    } catch (e) {
      console.error("Erreur recherche :", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // Redirige vers la page de login
  };

  const updateIncidentStatus = async (id, action) => {
    const token = localStorage.getItem("token");
    if (!token) return console.error("Token manquant.");
    try {
      await fetch(
        `https://api.supmap-server.pp.ua/incidents/incidents/${id}/${action}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPendingIncidents();
      fetchActiveIncidents();
      fetchResolvedIncidents();
    } catch (e) {
      console.error("Erreur mise à jour statut :", e);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case "congestion":
        return (
          <CongestionPeriods
            searchZone={searchZone}
            radius={radius}
            setSearchZone={setSearchZone}
            setRadius={setRadius}
            handleSearch={handleSearch}
            congestionData={congestionData}
            location={location}
          />
        );
      case "day":
        return <IncidentsPerDay incidentsPerDay={incidentsPerDay} />;
      case "pending":
        return (
          <PendingIncidents
            pendingIncidents={pendingIncidents}
            updateIncidentStatus={updateIncidentStatus}
          />
        );
      case "active":
        return (
          <ActiveIncidents
            activeIncidents={activeIncidents}
            updateIncidentStatus={updateIncidentStatus}
          />
        );
      case "resolved":
        return <ResolvedIncidents resolvedIncidents={resolvedIncidents} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-header">
      <h1>Tableau de Bord Administrateur</h1>
      <button className="logout-button" onClick={handleLogout}>
        Déconnexion
      </button>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentTab(tab.key)}
            className={`tab-button ${currentTab === tab.key ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;

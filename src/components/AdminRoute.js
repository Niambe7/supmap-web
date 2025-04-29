// src/components/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Si non connecté ou pas admin → redirection
  if (!token || role !== "admin") {
    return <Navigate to="/map" replace />;
  }

  return children;
};

export default AdminRoute;

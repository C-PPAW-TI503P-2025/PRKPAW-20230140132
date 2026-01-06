import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import DashboardPage from "./components/DashboardPage";
import PresensiPage from "./components/PresensiPage";
import ReportPage from "./components/ReportPage";
import SensorPage from "./components/SensorPage";

// Proteksi route
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// Redirect pintar saat landing
function HomeRedirect() {
  const token = localStorage.getItem("token");
  return token ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* LANDING */}
        <Route path="/" element={<HomeRedirect />} />

        {/* AUTH */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        {/* PRESENSI */}
        <Route
          path="/presensi"
          element={
            <PrivateRoute>
              <PresensiPage />
            </PrivateRoute>
          }
        />

        {/* MONITORING SUHU */}
        <Route
          path="/monitoring"
          element={
            <PrivateRoute>
              <SensorPage />
            </PrivateRoute>
          }
        />

        {/* REPORT ADMIN */}
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <ReportPage />
            </PrivateRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

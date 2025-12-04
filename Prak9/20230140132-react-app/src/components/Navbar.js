import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Token tidak valid:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  // Hide navbar on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold">Aplikasi Presensi</h1>

      <ul className="flex space-x-6 items-center">

        <li>
          <Link to="/dashboard" className="hover:text-gray-200">
            Dashboard
          </Link>
        </li>

        {/** PRESENSI SELALU ADA UNTUK SEMUA ROLE */}
        <li>
          <Link to="/presensi" className="hover:text-gray-200">
            Presensi
          </Link>
        </li>

        {/** HANYA ADMIN YANG MENAMPILKAN LAPORAN */}
        {user?.role === "admin" && (
          <li>
            <Link to="/reports" className="hover:text-gray-200">
              Laporan Admin
            </Link>
          </li>
        )}

        {user && (
          <li className="font-semibold">
            Halo, {user.email}
          </li>
        )}

        <li>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;

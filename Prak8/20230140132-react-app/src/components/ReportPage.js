import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await axios.get(
        "http://localhost:3001/api/reports/daily",
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          },
        }
      );

      setReports(res.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat laporan");
    }
  };

  const filteredReports = reports.filter((p) =>
    p.user?.email.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Laporan Presensi Harian
      </h1>

      <div className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Cari berdasarkan email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow px-3 py-2 border rounded-md"
        />
      </div>

      {error && (
        <p className="text-red-600 bg-red-100 p-4 rounded-md mb-4">{error}</p>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Email User
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Check-In
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Check-Out
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReports.length > 0 ? (
              filteredReports.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4">{p.user?.email || "N/A"}</td>
                  <td className="px-6 py-4">
                    {new Date(p.checkIn).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    {p.checkOut
                      ? new Date(p.checkOut).toLocaleString("id-ID")
                      : "Belum Check-Out"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-4 text-center text-gray-500"
                >
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportPage;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportPage() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [filterDate, setFilterDate] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  const navigate = useNavigate();

  // 🔥 TAMBAHAN: STATE UNTUK POPUP FOTO
  const [previewFoto, setPreviewFoto] = useState(null);

  const fetchReports = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      let url = "http://localhost:3001/api/reports/daily";

      // ======== 🔥 PRIORITAS FILTER ========
      if (filterDate) {
        url += `?tanggalMulai=${filterDate}&tanggalSelesai=${filterDate}`;
      } else if (filterMonth) {
        const [year, month] = filterMonth.split("-");
        const start = `${year}-${month}-01`;
        const end = `${year}-${month}-31`;
        url += `?tanggalMulai=${start}&tanggalSelesai=${end}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
        Laporan Presensi
      </h1>

      {/* ===================== FILTER BARU ===================== */}
      <div className="mb-6 grid grid-cols-3 gap-4">

        {/* Filter berdasarkan tanggal */}
        <div>
          <label className="block mb-1 text-sm font-semibold">Filter Tanggal</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setFilterMonth("");
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Filter berdasarkan bulan */}
        <div>
          <label className="block mb-1 text-sm font-semibold">Filter Bulan</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => {
              setFilterMonth(e.target.value);
              setFilterDate("");
            }}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {/* Tombol Apply */}
        <div className="flex items-end">
          <button
            onClick={fetchReports}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Terapkan Filter
          </button>
        </div>
      </div>

      {/* ===================== SEARCH EMAIL ===================== */}
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

      {/* ===================== TABEL ===================== */}
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

              {/* 🔥 TAMBAHAN: KOLUM BUKTI FOTO */}
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                Bukti Foto
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

                  {/* 🔥 FOTO (THUMBNAIL) */}
                  <td className="px-6 py-4">
  {p.buktiFoto ? (
    <img
      src={`http://localhost:3001/${p.buktiFoto}`}
      alt="bukti presensi"
      className="w-16 h-16 object-cover rounded cursor-pointer border"
      onClick={() =>
        setPreviewFoto(`http://localhost:3001/${p.buktiFoto}`)
      }
    />
  ) : (
    <span className="text-gray-500">Tidak ada foto</span>
  )}
</td>


                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===================== MODAL PREVIEW FOTO ===================== */}
      {previewFoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setPreviewFoto(null)}
        >
          <img
            src={previewFoto}
            alt="Foto Presensi"
            className="max-w-3xl max-h-[90vh] rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
}

export default ReportPage;

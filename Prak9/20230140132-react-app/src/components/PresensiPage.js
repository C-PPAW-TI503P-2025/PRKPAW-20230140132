import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Webcam from 'react-webcam';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function PresensiPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [coords, setCoords] = useState(null);

  const getToken = () => localStorage.getItem("token");

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          setError("Gagal mendapatkan lokasi: " + err.message);
        }
      );
    } else {
      setError("Browser tidak mendukung geolocation.");
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  // ====== Tambahan Kamera (dari kode kamu) ======
  const [image, setImage] = useState(null);
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);
  // ==============================================

  const handleCheckIn = async () => {
    if (!coords || !image) {
      setError("Lokasi dan Foto wajib ada!");
      return;
    }

    try {
      // ubah image base64 → blob
      const blob = await (await fetch(image)).blob();

      // FormData untuk kirim foto + koordinat
      const formData = new FormData();
      formData.append("latitude", coords.lat);
      formData.append("longitude", coords.lng);
      formData.append("image", blob, "selfie.jpg");

      const res = await axios.post(
        "http://localhost:3001/api/presensi/checkin",
        formData,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Check-in gagal");
    }
  };

  const handleCheckOut = async () => {
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        "http://localhost:3001/api/presensi/checkout",
        {},
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Check-out gagal");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">

      {/* MAP */}
      {coords && (
        <div className="w-full max-w-3xl mb-10 border rounded-xl shadow-lg overflow-hidden">
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={15}
            style={{ height: "350px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={[coords.lat, coords.lng]}>
              <Popup>Lokasi Anda Saat Ini</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      {/* CARD */}
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-3xl text-center">

        <h2 className="text-4xl font-bold mb-8 text-gray-800">
          Lakukan Presensi
        </h2>

        {/* KOORDINAT */}
        {coords && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-left">
            <p className="font-semibold text-gray-700">Koordinat Anda:</p>
            <p className="text-gray-600">
              Latitude: <strong>{coords.lat}</strong> |
              Longitude: <strong>{coords.lng}</strong>
            </p>
          </div>
        )}

        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* ====== TAMBAHAN TAMPILAN KAMERA ====== */}
        <div className="my-4 border rounded-lg overflow-hidden bg-black">
          {image ? (
            <img src={image} alt="Selfie" className="w-full" />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
            />
          )}
        </div>

        <div className="mb-4">
          {!image ? (
            <button onClick={capture} className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Ambil Foto 📸
            </button>
          ) : (
            <button onClick={() => setImage(null)} className="bg-gray-500 text-white px-4 py-2 rounded w-full">
              Foto Ulang 🔄
            </button>
          )}
        </div>
        {/* ======================================== */}

        {/* TOMBOL */}
        <div className="flex space-x-6">
          <button
            onClick={handleCheckIn}
            className="w-1/2 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-green-700"
          >
            Check-In
          </button>

          <button
            onClick={handleCheckOut}
            className="w-1/2 py-4 bg-red-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-red-700"
          >
            Check-Out
          </button>
        </div>

      </div>
    </div>
  );
}

export default PresensiPage;

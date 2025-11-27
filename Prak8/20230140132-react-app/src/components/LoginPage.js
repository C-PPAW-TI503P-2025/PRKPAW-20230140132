import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Login gagal.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Login
          </button>

        </form>

        {error && (
          <p className="text-red-600 text-center mt-4">{error}</p>
        )}

        {/* 🔥 Link ke halaman Register */}
        <p className="mt-6 text-center text-sm text-gray-700">
          Belum punya akun?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-green-600 hover:underline font-medium"
          >
            Register di sini
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

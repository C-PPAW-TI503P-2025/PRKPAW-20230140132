// routes/auth.js
const express = require("express");
const router = express.Router();

// Contoh data user sementara (harusnya pakai database)
const users = [];

// REGISTER
router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nama, email, dan password harus diisi" });
  }

  // Cek user sudah ada atau belum
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "Email sudah terdaftar" });
  }

  users.push({ name, email, password, role });
  console.log("🟢 User terdaftar:", users);

  res.json({ success: true, message: "Registrasi berhasil!" });
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password harus diisi" });
  }

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Email atau password salah" });
  }

  // Kirim token palsu (mock JWT untuk demo)
  const fakeToken = `token-${Date.now()}`;

  res.json({
    success: true,
    message: "Login berhasil!",
    token: fakeToken,
  });
});

module.exports = router;

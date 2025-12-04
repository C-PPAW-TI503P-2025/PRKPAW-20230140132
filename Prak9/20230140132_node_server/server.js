const db = require("./models")
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

db.sequelize.sync();

// ==========================
// Inisialisasi Express
// ==========================
const app = express();
const PORT = process.env.PORT || 3001;

// ==========================
// Middleware Dasar
// ==========================
app.use(
  cors({
    origin: "http://localhost:3000", // izinkan React kamu
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // tambahkan kalau nanti butuh kirim cookie/token
  })
);

app.use(express.json()); // supaya req.body bisa dibaca
app.use(express.urlencoded({ extended: true })); // biar bisa parsing form
app.use(morgan("dev")); // log request ke console
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware tambahan buat logging waktu request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ==========================
// ROUTES
// ==========================

// Root route (cek server hidup)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 API Server aktif dan berjalan!",
    info: "Gunakan /api/auth untuk autentikasi.",
  });
});

// Import dan gunakan router modular
const authRoutes = require("./routes/auth");
const presensiRoutes = require("./routes/presensi");
const reportRoutes = require("./routes/reports");
const booksRoutes = require("./routes/books");

// Daftarkan routes
app.use("/api/auth", authRoutes);
app.use("/api/presensi", presensiRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/books", booksRoutes);

// ==========================
// 404 Handler (endpoint tidak ditemukan)
// ==========================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan`,
  });
});

// ==========================
// Error Handler Global
// ==========================
app.use((err, req, res, next) => {
  console.error("❌ Terjadi error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan di server",
    error: err.message,
  });
});

// ==========================
// Jalankan Server
// ==========================
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di: http://localhost:${PORT}/`);
});

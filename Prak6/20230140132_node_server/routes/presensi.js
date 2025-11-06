const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const presensiController = require("../controllers/presensiController");
const permission = require("../middleware/permissionMiddleware");

// Middleware validasi tanggal
const validatePresensiUpdate = [
  body("checkIn")
    .optional()
    .isISO8601()
    .withMessage("checkIn harus berupa format tanggal yang valid (ISO8601)"),
  body("checkOut")
    .optional()
    .isISO8601()
    .withMessage("checkOut harus berupa format tanggal yang valid (ISO8601)"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validasi gagal", errors: errors.array() });
    }
    next();
  },
];

// ✅ gunakan permission.authenticateToken sekarang
router.post("/checkin", permission.authenticateToken, permission.isAdmin, presensiController.CheckIn);
router.post("/checkout", permission.authenticateToken, permission.isAdmin, presensiController.CheckOut);
router.put("/:id", permission.authenticateToken, permission.isAdmin, validatePresensiUpdate, presensiController.updatePresensi);
router.delete("/:id", permission.authenticateToken, permission.isAdmin, presensiController.deletePresensi);
router.get("/search", permission.authenticateToken, permission.isAdmin, presensiController.searchByNama);
router.get("/search-by-date", permission.authenticateToken, permission.isAdmin, presensiController.searchByTanggal);
router.get("/", permission.authenticateToken, permission.isAdmin, presensiController.getAllPresensi);

module.exports = router;

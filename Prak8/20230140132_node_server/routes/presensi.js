const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const presensiController = require("../controllers/presensiController");
const permission = require("../middleware/permissionMiddleware");

// VALIDASI UPDATE
const validatePresensiUpdate = [
  body("checkIn")
    .optional()
    .isISO8601()
    .withMessage("checkIn harus format tanggal (ISO8601)"),
  body("checkOut")
    .optional()
    .isISO8601()
    .withMessage("checkOut harus format tanggal (ISO8601)"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validasi gagal",
        errors: errors.array(),
      });
    }
    next();
  },
];

// ===============
// PRESENSI (Allowed untuk semua user login)
// ===============
router.post("/checkin", permission.authenticateToken, presensiController.CheckIn);
router.post("/check-in", permission.authenticateToken, presensiController.CheckIn);

router.post("/checkout", permission.authenticateToken, presensiController.CheckOut);
router.post("/check-out", permission.authenticateToken, presensiController.CheckOut);

// ===============
// ADMIN-ONLY
// ===============
router.put(
  "/:id",
  permission.authenticateToken,
  permission.isAdmin,
  validatePresensiUpdate,
  presensiController.updatePresensi
);

router.delete(
  "/:id",
  permission.authenticateToken,
  permission.isAdmin,
  presensiController.deletePresensi
);

router.get(
  "/search-by-date",
  permission.authenticateToken,
  permission.isAdmin,
  presensiController.searchByTanggal
);

router.get(
  "/",
  permission.authenticateToken,
  permission.isAdmin,
  presensiController.getAllPresensi
);

module.exports = router;

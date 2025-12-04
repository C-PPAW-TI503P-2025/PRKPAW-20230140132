const { Presensi, User } = require("../models");
const { Op } = require("sequelize");
const { format } = require("date-fns-tz");

const timeZone = "Asia/Jakarta";

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Format nama file: userId-timestamp.jpg
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });


// CHECK-IN
exports.CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const { latitude, longitude } = req.body;
   
    const buktiFoto = req.file ? req.file.path : null; 

    const existing = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (existing) {
      return res.status(400).json({
        message: "Anda sudah check-in dan belum check-out.",
      });
    }

    const newRecord = await Presensi.create({
      userId,
      checkIn: new Date(),
      latitude,
      longitude,
      buktiFoto: buktiFoto // Simpan path foto
    });

    res.status(201).json({
      message: "Check-in berhasil.",
      data: {
        userId,
        checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
          timeZone,
        }),

        // ⬇️ Tambahan lokasi dalam response
        latitude: newRecord.latitude,
        longitude: newRecord.longitude,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// CHECK-OUT
exports.CheckOut = async (req, res) => {
  try {
    console.log("CheckOut by:", req.user);

    const userId = req.user.id;
    const now = new Date();

    const record = await Presensi.findOne({
      where: { userId, checkOut: null },
    });

    if (!record) {
      return res.status(404).json({
        message: "Belum check-in.",
      });
    }

    record.checkOut = now;
    await record.save();

    res.json({
      message: "Check-out berhasil.",
      data: {
        userId,
        checkIn: record.checkIn,
        checkOut: record.checkOut,

        // (Lokasi tetap ditampilkan kalau mau)
        latitude: record.latitude,
        longitude: record.longitude,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// DELETE
exports.deletePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;

    const record = await Presensi.findByPk(presensiId);
    if (!record) {
      return res.status(404).json({
        message: "Data tidak ditemukan.",
      });
    }

    await record.destroy();

    res.json({ message: "Data berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// UPDATE
exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut } = req.body;

    const record = await Presensi.findByPk(presensiId);
    if (!record) {
      return res.status(404).json({
        message: "Data tidak ditemukan.",
      });
    }

    record.checkIn = checkIn || record.checkIn;
    record.checkOut = checkOut || record.checkOut;

    await record.save();

    res.json({
      message: "Update berhasil.",
      data: record,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// SEARCH TANGGAL
exports.searchByTanggal = async (req, res) => {
  try {
    const { tanggal } = req.query;

    if (!tanggal) {
      return res.status(400).json({
        message: "Tanggal wajib diisi.",
      });
    }

    const start = new Date(`${tanggal}T00:00:00`);
    const end = new Date(`${tanggal}T23:59:59`);

    const data = await Presensi.findAll({
      where: {
        checkIn: { [Op.between]: [start, end] },
      },
    });

    res.json({ message: "Data ditemukan", data });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET ALL (ADMIN)
exports.getAllPresensi = async (req, res) => {
  try {
    const data = await Presensi.findAll({
      include: {
        model: User,
        as: "user",
        attributes: ["id", "email", "role"],
      },
    });

    res.json({ message: "OK", data });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

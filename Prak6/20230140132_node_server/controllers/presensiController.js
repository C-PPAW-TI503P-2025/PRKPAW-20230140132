const { Presensi, User } = require("../models");
const { Op } = require("sequelize");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

// ============================
// CHECK-IN
// ============================
exports.CheckIn = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    const newRecord = await Presensi.create({
      userId: userId,
      nama: userName,
      checkIn: waktuSekarang,
    });

    const formattedData = {
      userId: newRecord.userId,
      nama: newRecord.nama,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", { timeZone }),
      checkOut: null,
    };

    res.status(201).json({
      message: `Halo ${userName}, check-in berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ============================
// CHECK-OUT
// ============================
exports.CheckOut = async (req, res) => {
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    const formattedData = {
      userId: recordToUpdate.userId,
      nama: recordToUpdate.nama,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
    };

    res.json({
      message: `Selamat jalan ${userName}, check-out berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// ============================
// DELETE PRESENSI
// ============================
exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;

    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res.status(404).json({ message: "Catatan presensi tidak ditemukan." });
    }

    if (recordToDelete.userId !== userId) {
      return res.status(403).json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }

    await recordToDelete.destroy();
    res.status(200).json({ message: "Data presensi berhasil dihapus." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// ============================
// UPDATE PRESENSI
// ============================
exports.updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut, nama } = req.body;
    if (checkIn === undefined && checkOut === undefined && nama === undefined) {
      return res.status(400).json({
        message:
          "Request body tidak berisi data yang valid untuk diupdate (checkIn, checkOut, atau nama).",
      });
    }
    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }

    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    recordToUpdate.nama = nama || recordToUpdate.nama;
    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// ============================
// SEARCH BERDASARKAN NAMA
// ============================
exports.searchByNama = async (req, res) => {
  try {
    const { nama } = req.query;

    if (!nama) {
      return res.status(400).json({ message: "Parameter nama harus diisi." });
    }

    const hasil = await Presensi.findAll({
      where: {
        nama: { [Op.like]: `%${nama}%` },
      },
    });

    if (hasil.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan." });
    }

    res.json({
      message: `Hasil pencarian untuk nama mengandung '${nama}'`,
      data: hasil,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// ============================
// SEARCH BERDASARKAN TANGGAL
// ============================
exports.searchByTanggal = async (req, res) => {
  try {
    const { tanggal } = req.query;

    if (!tanggal) {
      return res.status(400).json({ message: "Parameter tanggal harus diisi (format: YYYY-MM-DD)." });
    }

    const startDate = new Date(`${tanggal}T00:00:00`);
    const endDate = new Date(`${tanggal}T23:59:59`);

    const hasil = await Presensi.findAll({
      where: {
        checkIn: { [Op.between]: [startDate, endDate] },
      },
    });

    if (hasil.length === 0) {
      return res.status(404).json({ message: "Tidak ada presensi pada tanggal tersebut." });
    }

    res.json({
      message: `Hasil presensi untuk tanggal ${tanggal}`,
      data: hasil,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// ============================
// GET ALL (Include User dari relasi)
// ============================
exports.getAllPresensi = async (req, res) => {
  try {
    const hasil = await Presensi.findAll({
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'nama', 'email', 'role']
      }
    });

    res.json({
      message: "Data presensi beserta data user",
      data: hasil,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

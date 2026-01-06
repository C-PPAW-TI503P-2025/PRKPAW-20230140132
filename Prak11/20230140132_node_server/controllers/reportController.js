const { Presensi, User } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;

    let whereClause = {};

    if (tanggalMulai && tanggalSelesai) {
      whereClause.checkIn = {
        [Op.between]: [
          new Date(tanggalMulai + "T00:00:00"),
          new Date(tanggalSelesai + "T23:59:59"),
        ],
      };
    }

    const records = await Presensi.findAll({
      where: whereClause,

      // 📌 PENTING: pastikan buktiFoto ikut dikirim
      attributes: {
        include: ["buktiFoto"]
      },

      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "role"],
          where: nama
            ? { email: { [Op.like]: `%${nama}%` } }
            : undefined,
        },
      ],

      order: [["checkIn", "DESC"]],
    });

    res.json({
      success: true,
      reportDate: new Date().toLocaleDateString("id-ID"),
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan harian",
      error: error.message,
    });
  }
};

const { Presensi } = require("../models");
const { Op } = require("sequelize");

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggalMulai, tanggalSelesai } = req.query;
    let options = { where: {} };

    // Filter nama (kalau dikirim di query)
    if (nama) {
      options.where.nama = { [Op.like]: `%${nama}%` };
    }

    // Filter berdasarkan rentang tanggal checkIn (kalau dikirim dua-duanya)
    if (tanggalMulai && tanggalSelesai) {
      options.where.checkIn = {
        [Op.between]: [new Date(tanggalMulai), new Date(tanggalSelesai)],
      };
    }

    const records = await Presensi.findAll(options);

    res.json({
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

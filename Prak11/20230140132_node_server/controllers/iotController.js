const { SensorLog } = require("../models");

/**
 * TERIMA DATA DARI ESP32
 * Method: POST
 */
const receiveSensorData = async (req, res) => {
  try {
    const { suhu, kelembaban, cahaya } = req.body;

    // Validasi dasar
    if (suhu === undefined || kelembaban === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Data suhu atau kelembaban tidak valid",
      });
    }

    // Simpan ke database
    const newData = await SensorLog.create({
      suhu: parseFloat(suhu),
      kelembaban: parseFloat(kelembaban),
      cahaya: cahaya !== undefined ? parseInt(cahaya) : 0,
    });

    console.log(
      `💾 [SAVED] Suhu: ${newData.suhu}°C | Lembab: ${newData.kelembaban}% | Cahaya: ${newData.cahaya}`
    );

    return res.status(201).json({
      status: "ok",
      message: "Data berhasil disimpan",
    });
  } catch (error) {
    console.error("❌ Gagal menyimpan data:", error);
    return res.status(500).json({
      status: "error",
      message: "Gagal menyimpan data sensor",
    });
  }
};

/**
 * AMBIL RIWAYAT DATA SENSOR
 * Method: GET
 */
const getSensorHistory = async (req, res) => {
  try {
    const data = await SensorLog.findAll({
      limit: 20,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      status: "success",
      data: data.reverse(), // supaya grafik urut kiri → kanan
    });
  } catch (error) {
    console.error("❌ Gagal ambil data:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  receiveSensorData,
  getSensorHistory,
};

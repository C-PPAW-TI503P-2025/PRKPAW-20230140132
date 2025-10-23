const express = require('express');
const router = express.Router();
const presensiController = require('../controllers/presensiController');
const reportController = require('../controllers/reportController');

router.post('/checkin', presensiController.CheckIn);
router.post('/checkout', presensiController.CheckOut);

module.exports = router;

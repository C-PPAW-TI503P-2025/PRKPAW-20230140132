const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const { authenticateToken, isAdmin } = require('../middleware/permissionMiddleware');

// GET /api/reports/daily
router.get('/daily', authenticateToken, isAdmin, reportController.getDailyReport);

module.exports = router;

const express = require("express");
const router = express.Router();

const iotController = require("../controllers/iotController");


// ROUTE
router.post("/data", iotController.receiveSensorData);
router.get("/history", iotController.getSensorHistory);

module.exports = router;

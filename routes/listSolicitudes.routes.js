const express = require("express");
const router = express.Router();
const controller = require("../controllers/listSolicitudes.controller");

// GET lista
router.get("/", controller.getSolicitudes);

module.exports = router;
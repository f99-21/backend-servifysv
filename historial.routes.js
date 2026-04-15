const express = require("express");
const router = express.Router();
const historialController = require("../controllers/historial.controller");

// 📋 historial del usuario
router.get("/:idUsuario", historialController.getHistorial);

module.exports = router;
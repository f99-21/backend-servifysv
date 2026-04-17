const express = require("express");
const router = express.Router();
const controller = require("../controllers/detalleSolicitud.controller");

// GET detalle
router.get("/:id", controller.getDetalleSolicitud);

module.exports = router;
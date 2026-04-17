const express = require("express");
const router = express.Router();
const controller = require("../controllers/calificaciones.controller");

router.post("/", controller.crearCalificacion);

module.exports = router;
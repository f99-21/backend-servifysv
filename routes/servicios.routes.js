const express = require("express");
const router = express.Router();
const serviciosController = require("../controllers/servicios.controller");

// LISTAR SERVICIOS
router.get("/", serviciosController.getServicios);

router.get("/profesional/:id", serviciosController.getProfesionalById);

module.exports = router;
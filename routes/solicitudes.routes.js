const express = require("express");
const router = express.Router();
const solicitudesController = require("../controllers/solicitudes.controller");


router.post("/", solicitudesController.crearSolicitud);

module.exports = router;
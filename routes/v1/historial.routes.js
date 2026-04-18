const express = require("express");
const router = express.Router();
const historialController = require("../../controllers/historial.controller");
const { validateParams } = require("../../middleware/validation.middleware");
const { idUsuarioSchema } = require("../../schemas/historial.schema");
const { verifyToken } = require("../../middleware/auth.middleware");

router.get("/cliente/:idUsuario", verifyToken, validateParams(idUsuarioSchema), historialController.getHistorial);

router.get("/profesional/:idUsuario/trabajos", verifyToken, validateParams(idUsuarioSchema), historialController.obtenerTrabajosProfesional);

router.get("/profesional/:idUsuario/ingresos", verifyToken, validateParams(idUsuarioSchema), historialController.obtenerIngresosProfesional);

module.exports = router;

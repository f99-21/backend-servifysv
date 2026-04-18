const express = require("express");
const router = express.Router();
const historialController = require("../../controllers/historial.controller");
const { validateParams } = require("../../middleware/validation.middleware");
const { idUsuarioSchema } = require("../../schemas/historial.schema");
const { verifyToken } = require("../../middleware/auth.middleware");

router.get("/:idUsuario", verifyToken, validateParams(idUsuarioSchema), historialController.getHistorial);

module.exports = router;

const express = require("express");
const router = express.Router();
const resenaController = require("../../controllers/resena.controller");
const { validateRequest, validateParams } = require("../../middleware/validation.middleware");
const {
    crearResenaSchema,
    idResenaSchema,
    idProfesionalSchema,
    idSolicitudSchema
} = require("../../schemas/resena.schema");
const { verifyToken } = require("../../middleware/auth.middleware");

router.post("/", verifyToken, validateRequest(crearResenaSchema), resenaController.crearResena);

router.get("/profesional/:id", validateParams(idProfesionalSchema), resenaController.obtenerResenasProfesional);

router.get("/solicitud/:id", verifyToken, validateParams(idSolicitudSchema), resenaController.obtenerResenasPorSolicitud);

router.put("/:id", verifyToken, validateParams(idResenaSchema), validateRequest(crearResenaSchema), resenaController.actualizarResena);

router.delete("/:id", verifyToken, validateParams(idResenaSchema), resenaController.eliminarResena);

module.exports = router;

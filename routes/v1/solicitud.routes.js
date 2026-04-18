const express = require("express");
const router = express.Router();
const solicitudController = require("../../controllers/solicitud.controller");
const { validateRequest, validateParams } = require("../../middleware/validation.middleware");
const {
    crearSolicitudSchema,
    actualizarEstadoSchema,
    idSolicitudSchema,
    idUsuarioSchema
} = require("../../schemas/solicitud.schema");
const { verifyToken } = require("../../middleware/auth.middleware");

router.post("/", verifyToken, validateRequest(crearSolicitudSchema), solicitudController.crearSolicitud);

router.get("/profesional/:id", verifyToken, validateParams(idUsuarioSchema), solicitudController.obtenerSolicitudesProfesional);

router.get("/cliente/:id", verifyToken, validateParams(idUsuarioSchema), solicitudController.obtenerSolicitudesCliente);

router.get("/:id", verifyToken, validateParams(idSolicitudSchema), solicitudController.obtenerDetalleSolicitud);

router.patch("/:id/estado", verifyToken, validateParams(idSolicitudSchema), validateRequest(actualizarEstadoSchema), solicitudController.actualizarEstadoSolicitud);

module.exports = router;

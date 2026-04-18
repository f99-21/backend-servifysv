const express = require("express");
const router = express.Router();
const serviciosController = require("../../controllers/servicios.controller");
const { validateParams, validateRequest } = require("../../middleware/validation.middleware");
const { profesionalIdSchema, crearServicioSchema, actualizarServicioSchema, idServicioSchema } = require("../../schemas/servicios.schema");
const { verifyToken } = require("../../middleware/auth.middleware");

router.get("/", serviciosController.getServicios);

router.post("/", verifyToken, validateRequest(crearServicioSchema), serviciosController.crearServicio);

router.get("/profesional/:id", validateParams(profesionalIdSchema), serviciosController.getProfesionalById);

router.get("/mis-servicios/:id", verifyToken, validateParams(profesionalIdSchema), serviciosController.obtenerServiciosProfesional);

router.put("/:id", verifyToken, validateParams(idServicioSchema), validateRequest(actualizarServicioSchema), serviciosController.actualizarServicio);

router.delete("/:id", verifyToken, validateParams(idServicioSchema), serviciosController.eliminarServicio);

module.exports = router;

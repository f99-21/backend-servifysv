const express = require("express");
const router = express.Router();
const profesionalesController = require("../../controllers/profesionales.controller");
const { validateParams, validateRequest } = require("../../middleware/validation.middleware");
const { categoriaSchema, actualizarPerfilProfesionalSchema, idProfesionalSchema } = require("../../schemas/profesionales.schema");
const { verifyToken, requireRole } = require("../../middleware/auth.middleware");

router.get("/", profesionalesController.getProfesionales);

router.get("/buscar", profesionalesController.buscar);

router.get("/categoria/:categoria", validateParams(categoriaSchema), profesionalesController.getByCategoria);

router.get("/:id", validateParams(idProfesionalSchema), profesionalesController.obtenerPerfilCompleto);

router.put("/:id", verifyToken, requireRole("profesional"), validateParams(idProfesionalSchema), validateRequest(actualizarPerfilProfesionalSchema), profesionalesController.actualizarPerfil);

module.exports = router;

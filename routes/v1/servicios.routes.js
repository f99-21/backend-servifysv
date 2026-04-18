const express = require("express");
const router = express.Router();
const serviciosController = require("../../controllers/servicios.controller");
const { validateParams } = require("../../middleware/validation.middleware");
const { profesionalIdSchema } = require("../../schemas/servicios.schema");
const { verifyToken } = require("../../middleware/auth.middleware");

router.get("/", serviciosController.getServicios);

router.get("/profesional/:id", validateParams(profesionalIdSchema), serviciosController.getProfesionalById);

module.exports = router;

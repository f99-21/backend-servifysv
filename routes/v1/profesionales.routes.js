const express = require("express");
const router = express.Router();
const profesionalesController = require("../../controllers/profesionales.controller");
const { validateParams } = require("../../middleware/validation.middleware");
const { categoriaSchema } = require("../../schemas/profesionales.schema");

router.get("/", profesionalesController.getProfesionales);

router.get("/categoria/:categoria", validateParams(categoriaSchema), profesionalesController.getByCategoria);

module.exports = router;

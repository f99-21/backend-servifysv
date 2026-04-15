const express = require("express");
const router = express.Router();
const profesionalesController = require("../controllers/profesionales.controller");

// 📋 listar profesionales
router.get("/", profesionalesController.getProfesionales);

// 🔍 buscar por categoría
router.get("/categoria/:categoria", profesionalesController.getByCategoria);

module.exports = router;
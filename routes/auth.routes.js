const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// REGISTRO
router.post("/register", authController.register);

// LOGIN
router.post("/login", authController.login);
// PERFIL
router.get("/perfil/:id", authController.getPerfil);

module.exports = router;
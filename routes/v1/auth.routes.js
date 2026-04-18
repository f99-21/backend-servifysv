const express = require("express");
const router = express.Router();
const authController = require("../../controllers/auth.controller");
const { validateRequest, validateParams } = require("../../middleware/validation.middleware");
const { registerSchema, loginSchema, perfilSchema } = require("../../schemas/auth.schema");
const { verifyToken } = require("../../middleware/auth.middleware");

router.post("/register", validateRequest(registerSchema), authController.register);

router.post("/login", validateRequest(loginSchema), authController.login);

router.get("/perfil/:id", verifyToken, validateParams(perfilSchema), authController.getPerfil);

module.exports = router;

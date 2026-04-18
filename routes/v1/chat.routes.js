const express = require("express");
const router = express.Router();
const chatController = require("../../controllers/chat.controller");
const { validateRequest, validateParams } = require("../../middleware/validation.middleware");
const { mensajeSchema, idSolicitudSchema, idUsuarioSchema } = require("../../schemas/chat.schema");
const { verifyToken } = require("../../middleware/auth.middleware");

router.get("/mensajes/:idSolicitud", verifyToken, validateParams(idSolicitudSchema), chatController.getMensajes);

router.post("/mensaje", verifyToken, validateRequest(mensajeSchema), chatController.sendMensaje);

router.get("/chats/:idUsuario", verifyToken, validateParams(idUsuarioSchema), chatController.getChats);

module.exports = router;

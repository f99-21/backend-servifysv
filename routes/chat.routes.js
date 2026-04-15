const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

// 📥 obtener mensajes de un chat
router.get("/:idSolicitud", chatController.getMensajes);

// 📤 enviar mensaje
router.post("/send", chatController.sendMensaje);

// 📋 lista de chats del usuario
router.get("/chats/:idUsuario", chatController.getChats);

module.exports = router;
const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");

router.get("/chats/:idUsuario", chatController.getChats);

// 📥 obtener mensajes de una solicitud
router.get("/:idSolicitud", chatController.getMensajes);

// 📤 enviar mensaje
router.post("/send", chatController.sendMensaje);

module.exports = router;
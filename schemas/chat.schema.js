const Joi = require("joi");

exports.mensajeSchema = Joi.object({
    idSolicitud: Joi.number().integer().positive().required(),
    idRemitente: Joi.number().integer().positive().required(),
    contenido: Joi.string().min(1).max(5000).required().messages({
        "string.empty": "El mensaje no puede estar vacío"
    })
});

exports.idSolicitudSchema = Joi.object({
    idSolicitud: Joi.number().integer().positive().required()
});

exports.idUsuarioSchema = Joi.object({
    idUsuario: Joi.number().integer().positive().required()
});

const Joi = require("joi");

exports.crearResenaSchema = Joi.object({
    idSolicitud: Joi.number().integer().positive().required().messages({
        "number.base": "ID solicitud debe ser un número"
    }),
    idCliente: Joi.number().integer().positive().required().messages({
        "number.base": "ID cliente debe ser un número"
    }),
    idProfesional: Joi.number().integer().positive().required().messages({
        "number.base": "ID profesional debe ser un número"
    }),
    calificacion: Joi.number().integer().min(1).max(5).required().messages({
        "number.min": "Calificación mínima es 1",
        "number.max": "Calificación máxima es 5"
    }),
    comentario: Joi.string().min(5).max(1000).required().messages({
        "string.min": "El comentario debe tener al menos 5 caracteres",
        "string.max": "El comentario no puede exceder 1000 caracteres"
    })
});

exports.idResenaSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

exports.idProfesionalSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

exports.idSolicitudSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

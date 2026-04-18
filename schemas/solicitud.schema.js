const Joi = require("joi");

exports.crearSolicitudSchema = Joi.object({
    idCliente: Joi.number().integer().positive().required().messages({
        "number.base": "ID cliente debe ser un número"
    }),
    idProfesional: Joi.number().integer().positive().required().messages({
        "number.base": "ID profesional debe ser un número"
    }),
    idServicio: Joi.number().integer().positive().required().messages({
        "number.base": "ID servicio debe ser un número"
    }),
    descripcion: Joi.string().min(10).max(500).required().messages({
        "string.min": "Descripción debe tener al menos 10 caracteres",
        "string.max": "Descripción no puede exceder 500 caracteres"
    })
});

exports.actualizarEstadoSchema = Joi.object({
    estado: Joi.string().valid("pendiente", "aceptada", "rechazada", "completada", "cancelada").required().messages({
        "any.only": "Estado debe ser uno de: pendiente, aceptada, rechazada, completada, cancelada"
    })
});

exports.idSolicitudSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

exports.idUsuarioSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

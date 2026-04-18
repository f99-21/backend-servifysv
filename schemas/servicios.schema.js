const Joi = require("joi");

exports.profesionalIdSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "El ID debe ser un número"
    })
});

exports.paginacionSchema = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().max(100).default(10)
});

exports.crearServicioSchema = Joi.object({
    idProfesional: Joi.number().integer().positive().required().messages({
        "number.base": "ID profesional debe ser un número"
    }),
    nombreServicio: Joi.string().min(5).max(100).required().messages({
        "string.min": "El nombre debe tener al menos 5 caracteres",
        "string.max": "El nombre no puede exceder 100 caracteres"
    }),
    categoria: Joi.string().required().messages({
        "string.empty": "La categoría es requerida"
    }),
    descripcion: Joi.string().min(10).max(1000).required().messages({
        "string.min": "La descripción debe tener al menos 10 caracteres",
        "string.max": "La descripción no puede exceder 1000 caracteres"
    }),
    precioReferencia: Joi.number().positive().required().messages({
        "number.base": "El precio debe ser un número válido"
    }),
    disponibilidad: Joi.boolean().default(true)
});

exports.actualizarServicioSchema = Joi.object({
    nombreServicio: Joi.string().min(5).max(100),
    categoria: Joi.string(),
    descripcion: Joi.string().min(10).max(1000),
    precioReferencia: Joi.number().positive(),
    disponibilidad: Joi.boolean()
}).min(1);

exports.idServicioSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

const Joi = require("joi");

exports.categoriaSchema = Joi.object({
    categoria: Joi.string().required().messages({
        "string.empty": "La categoría no puede estar vacía"
    })
});

exports.paginacionSchema = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().max(100).default(10)
});

exports.actualizarPerfilProfesionalSchema = Joi.object({
    especialidad: Joi.string().max(100),
    descripcion: Joi.string().max(1000),
    experiencia: Joi.number().integer().min(0),
    biografia: Joi.string().max(1000)
}).min(1).messages({
    "object.min": "Debe proporcionar al menos un campo para actualizar"
});

exports.idProfesionalSchema = Joi.object({
    id: Joi.number().integer().positive().required()
});

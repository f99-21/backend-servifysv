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

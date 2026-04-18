const Joi = require("joi");

exports.idUsuarioSchema = Joi.object({
    idUsuario: Joi.number().integer().positive().required()
});

exports.paginacionSchema = Joi.object({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().max(100).default(10)
});

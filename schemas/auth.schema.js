const Joi = require("joi");

exports.registerSchema = Joi.object({
    nombre: Joi.string().min(3).max(100).required().messages({
        "string.empty": "El nombre no puede estar vacío",
        "string.min": "El nombre debe tener al menos 3 caracteres"
    }),
    correo: Joi.string().email().required().messages({
        "string.email": "El correo debe ser válido"
    }),
    contraseña: Joi.string().min(6).required().messages({
        "string.min": "La contraseña debe tener al menos 6 caracteres"
    }),
    tipo_usuario: Joi.string().valid("cliente", "profesional").required().messages({
        "any.only": "El tipo de usuario debe ser 'cliente' o 'profesional'"
    })
});

exports.loginSchema = Joi.object({
    correo: Joi.string().email().required().messages({
        "string.email": "El correo debe ser válido"
    }),
    contraseña: Joi.string().min(6).required().messages({
        "string.min": "La contraseña es requerida"
    })
});

exports.perfilSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "El ID debe ser un número"
    })
});

exports.actualizarPerfilSchema = Joi.object({
    nombre: Joi.string().min(3).max(100),
    telefono: Joi.string().max(20),
    correo: Joi.string().email()
}).min(1).messages({
    "object.min": "Debe proporcionar al menos un campo para actualizar"
});

const Joi = require("joi");

exports.validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const messages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: "Datos inválidos",
                errors: messages
            });
        }

        req.validatedData = value;
        next();
    };
};

exports.validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false
        });

        if (error) {
            const messages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: "Parámetros inválidos",
                errors: messages
            });
        }

        req.validatedParams = value;
        next();
    };
};

exports.validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false
        });

        if (error) {
            const messages = error.details.map(detail => detail.message);
            return res.status(400).json({
                success: false,
                message: "Parámetros de búsqueda inválidos",
                errors: messages
            });
        }

        req.validatedQuery = value;
        next();
    };
};

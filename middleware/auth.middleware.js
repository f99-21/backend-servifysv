const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Token no proporcionado"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado"
        });
    }
};

exports.requireRole = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: "No autenticado" });
    }
    if (!roles.includes(req.user.tipo_usuario)) {
        return res.status(403).json({ success: false, message: "Acceso no permitido" });
    }
    next();
};

exports.generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id_usuario,
            correo: user.correo,
            tipo_usuario: user.tipo_usuario
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

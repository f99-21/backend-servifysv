exports.errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    const statusCode = err.statusCode || 500;
    const message = err.message || "Error interno del servidor";

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === "development" && { error: err })
    });
};

exports.notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: "Ruta no encontrada"
    });
};

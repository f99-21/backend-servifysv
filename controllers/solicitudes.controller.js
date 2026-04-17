const db = require("../db");

exports.crearSolicitud = (req, res) => {
    const { id_usuario, id_profesional, id_servicio, descripcion } = req.body;

    db.query(
        "INSERT INTO Solicitud (id_usuario, id_profesional, id_servicio, descripcion, estado, fecha) VALUES (?, ?, ?, ?, 'pendiente', NOW())",
        [id_usuario, id_profesional, id_servicio, descripcion],
        (err) => {
            if (err) {
                return res.status(500).json({ ok: false });
            }

            res.json({ ok: true });
        }
    );
};
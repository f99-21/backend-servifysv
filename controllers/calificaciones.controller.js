const db = require("../db");

exports.crearCalificacion = (req, res) => {
    const { id_solicitud, id_profesional, puntuacion, comentario } = req.body;

    db.query(
        "INSERT INTO Calificacion (id_solicitud, id_profesional, puntuacion, comentario) VALUES (?, ?, ?, ?)",
        [id_solicitud, id_profesional, puntuacion, comentario],
        (err) => {
            if (err) {
                return res.status(500).json({ ok: false });
            }

            res.json({ ok: true });
        }
    );
};
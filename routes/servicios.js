const express = require("express");
const router = express.Router();
const db = require("../db");

// 🔥 LISTAR SERVICIOS
router.get("/servicios", (req, res) => {
    const query = `
        SELECT 
            s.id_servicio,
            s.nombre_servicio,
            s.categoria,
            s.precio_referencia,
            s.disponibilidad,
            p.especialidad,
            u.nombre AS profesional
        FROM Servicio s
        INNER JOIN Profesional p ON s.id_profesional = p.id_profesional
        INNER JOIN Usuario u ON p.id_usuario = u.id_usuario
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        res.json(results);
    });
});

module.exports = router;
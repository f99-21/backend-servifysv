const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
const authRoutes = require("./routes/auth.routes");
const serviciosRoutes = require("./routes/servicios.routes");
const chatRoutes = require("./routes/chat.routes");
const historialRoutes = require("./routes/historial.routes");
const profesionalesRoutes = require("./routes/profesionales.routes");
const calificacionesRoutes = require("./routes/calificaciones.routes");
const solicitudesRoutes = require("./routes/solicitudes.routes");
const detalleSolicitudRoutes = require("./routes/detalleSolicitud.routes");
const listSolicitudesRoutes = require("./routes/listSolicitudes.routes");


app.use("/api/auth", authRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/profesionales", profesionalesRoutes);
app.use("/api/calificaciones", calificacionesRoutes);
app.use("/api/solicitudes", solicitudesRoutes);
app.use("/api/detalle-solicitud", detalleSolicitudRoutes);
app.use("/api/solicitudes-list", listSolicitudesRoutes);

// TEST
app.get("/", (req, res) => {
    res.send("API ServifySV funcionando 🔥");
});

/*
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
});
 */


const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
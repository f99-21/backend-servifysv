const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// rutas
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

// prueba
app.get("/", (req, res) => {
    res.send("API ServifySV funcionando 🔥");
});
//servicios
const serviciosRoutes = require("./routes/servicios");
app.use("/api", serviciosRoutes);

app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});
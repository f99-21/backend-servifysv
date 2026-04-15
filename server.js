const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// rutas
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

const serviciosRoutes = require("./routes/servicios");
app.use("/api", serviciosRoutes);

// prueba
app.get("/", (req, res) => {
    res.send("API ServifySV funcionando 🔥");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
});
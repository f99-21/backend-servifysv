const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
const authRoutes = require("./routes/auth.routes");
const serviciosRoutes = require("./routes/servicios.routes");
const chatRoutes = require("./routes/chat.routes");

app.use("/api/auth", authRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/chat", chatRoutes);

// TEST
app.get("/", (req, res) => {
    res.send("API ServifySV funcionando 🔥");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto", PORT);
});

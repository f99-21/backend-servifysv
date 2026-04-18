require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Demasiadas solicitudes, intenta más tarde",
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Demasiados intentos de login, intenta más tarde",
    skipSuccessfulRequests: true
});

app.use("/api/", limiter);
app.use("/api/v1/auth/login", authLimiter);
app.use("/api/v1/auth/register", authLimiter);

// Routes
const authRoutes = require("./routes/v1/auth.routes");
const serviciosRoutes = require("./routes/v1/servicios.routes");
const chatRoutes = require("./routes/v1/chat.routes");
const historialRoutes = require("./routes/v1/historial.routes");
const profesionalesRoutes = require("./routes/v1/profesionales.routes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/servicios", serviciosRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/historial", historialRoutes);
app.use("/api/v1/profesionales", profesionalesRoutes);

// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
    res.json({
        message: "API ServifySV v1 funcionando 🔥",
        version: "1.0.0",
        endpoints: {
            auth: "/api/v1/auth",
            servicios: "/api/v1/servicios",
            profesionales: "/api/v1/profesionales",
            chat: "/api/v1/chat",
            historial: "/api/v1/historial"
        }
    });
});

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en puerto ${PORT} 🔥`);
    console.log(`Ambiente: ${process.env.NODE_ENV || "development"}`);
});
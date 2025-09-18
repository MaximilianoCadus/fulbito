require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Importar middleware
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/logger");

// Importar rutas
const apiRoutes = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware global
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);

// Configurar rutas
app.use("/api", apiRoutes);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Ruta para URLs no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Ruta no encontrada",
    message: `No se encontró la ruta ${req.originalUrl}`,
  });
});

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("✔️ Conectado a MongoDB");

    // Iniciar servidor solo después de conectar a la base de datos
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("❌ Error MongoDB:", err);
    process.exit(1);
  });

// Manejo de errores no capturados
process.on("unhandledRejection", (err, promise) => {
  console.error("❌ Error no manejado:", err.message);
  // Cerrar servidor y salir del proceso
  process.exit(1);
});

module.exports = app;

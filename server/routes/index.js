const express = require("express");
const router = express.Router();

// Importar todas las rutas
const userRoutes = require("./userRoutes");
const jugadorRoutes = require("./jugadorRoutes");
const empresaRoutes = require("./empresaRoutes");
const predioRoutes = require("./predioRoutes");
const canchaRoutes = require("./canchaRoutes");
const reservaRoutes = require("./reservaRoutes");
const localidadRoutes = require("./localidadRoutes");

// Configurar rutas base
router.use("/users", userRoutes);
router.use("/jugadores", jugadorRoutes);
router.use("/empresas", empresaRoutes);
router.use("/predios", predioRoutes);
router.use("/canchas", canchaRoutes);
router.use("/reservas", reservaRoutes);
router.use("/localidades", localidadRoutes);

// Ruta de salud del API
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Fulbito API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Ruta base del API
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Bienvenido a Fulbito API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      jugadores: "/api/jugadores",
      empresas: "/api/empresas",
      predios: "/api/predios",
      canchas: "/api/canchas",
      reservas: "/api/reservas",
      localidades: "/api/localidades",
      health: "/api/health",
    },
  });
});

module.exports = router;

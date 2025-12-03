const express = require("express");
const router = express.Router();
const {
  getAllReservas,
  getReservaById,
  getReservasByJugador,
  getReservasByCancha,
  getReservasByEstado,
  getReservasByFecha,
  createReserva,
  updateReserva,
  confirmarReserva,
  cancelarReserva,
  deleteReserva,
} = require("../controllers/reservaController");

// Rutas específicas
router.get("/jugador/:jugadorId", getReservasByJugador);
router.get("/cancha/:canchaId", getReservasByCancha);
router.get("/estado/:estado", getReservasByEstado);
router.get("/fecha/:fecha", getReservasByFecha);

// Rutas básicas CRUD
router.get("/", getAllReservas);
router.get("/:id", getReservaById);
router.post("/", createReserva);
router.put("/:id", updateReserva);
router.delete("/:id", deleteReserva);

// Rutas para cambio de estado
router.put("/:id/confirmar", confirmarReserva);
router.put("/:id/cancelar", cancelarReserva);

module.exports = router;

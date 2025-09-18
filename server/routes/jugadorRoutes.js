const express = require("express");
const router = express.Router();
const {
  getAllJugadores,
  getJugadorById,
  createJugador,
  updateJugador,
  deleteJugador,
  addReservaToJugador,
  removeReservaFromJugador,
} = require("../controllers/jugadorController");

// Rutas básicas CRUD
router.get("/", getAllJugadores);
router.get("/:id", getJugadorById);
router.post("/", createJugador);
router.put("/:id", updateJugador);
router.delete("/:id", deleteJugador);

// Rutas para manejo de reservas
router.put("/:id/reservas/add", addReservaToJugador);
router.put("/:id/reservas/remove", removeReservaFromJugador);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getAllCanchas,
  getCanchaById,
  getCanchasByPredio,
  getCanchasDisponibles,
  getCanchasByFilters,
  createCancha,
  updateCancha,
  deleteCancha,
  addDisponibilidadToCancha,
  removeDisponibilidadFromCancha,
  updateDisponibilidadCancha,
} = require("../controllers/canchaController");

// Rutas de búsqueda y filtros (deben ir ANTES de las rutas con parámetros)
router.get("/search/disponibles", getCanchasDisponibles);
router.get("/search/filters", getCanchasByFilters);
router.get("/predio/:predioId", getCanchasByPredio);

// Rutas básicas CRUD
router.get("/", getAllCanchas);
router.get("/:id", getCanchaById);
router.post("/", createCancha);
router.put("/:id", updateCancha);
router.delete("/:id", deleteCancha);

// Rutas para manejo de disponibilidad
router.put("/:id/disponibilidad/add", addDisponibilidadToCancha);
router.put("/:id/disponibilidad/remove", removeDisponibilidadFromCancha);
router.put("/:id/disponibilidad/update", updateDisponibilidadCancha);

module.exports = router;

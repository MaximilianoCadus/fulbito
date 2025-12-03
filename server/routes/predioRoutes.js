const express = require("express");
const router = express.Router();
const {
  getAllPredios,
  getPredioById,
  getPrediosByEmpresa,
  createPredio,
  updatePredio,
  deletePredio,
  addCanchaToPredio,
  removeCanchaFromPredio,
  addHorarioToPredio,
  removeHorarioFromPredio,
  updatePredioCredentials,
} = require("../controllers/predioController");

// Rutas específicas
router.get("/empresa/:empresaId", getPrediosByEmpresa);

// Rutas básicas CRUD
router.get("/", getAllPredios);
router.get("/:id", getPredioById);
router.post("/", createPredio);
router.put("/:id", updatePredio);
router.delete("/:id", deletePredio);

// Rutas para manejo de canchas
router.put("/:id/canchas/add", addCanchaToPredio);
router.put("/:id/canchas/remove", removeCanchaFromPredio);

// Rutas para manejo de horarios
router.put("/:id/horarios/add", addHorarioToPredio);
router.put("/:id/horarios/remove", removeHorarioFromPredio);

// Ruta para actualizar credenciales de predio
router.put("/:id/credentials", updatePredioCredentials);

module.exports = router;

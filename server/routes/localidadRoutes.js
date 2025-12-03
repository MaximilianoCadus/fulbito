const express = require("express");
const router = express.Router();
const {
  getAllLocalidades,
  getLocalidadById,
  getLocalidadByCP,
  searchLocalidadesByNombre,
  createLocalidad,
  updateLocalidad,
  deleteLocalidad,
} = require("../controllers/localidadController");

// Rutas de búsqueda
router.get("/cp/:cp", getLocalidadByCP);
router.get("/search/nombre", searchLocalidadesByNombre);

// Rutas básicas CRUD
router.get("/", getAllLocalidades);
router.get("/:id", getLocalidadById);
router.post("/", createLocalidad);
router.put("/:id", updateLocalidad);
router.delete("/:id", deleteLocalidad);

module.exports = router;

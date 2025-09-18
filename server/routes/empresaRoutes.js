const express = require("express");
const router = express.Router();
const {
  getAllEmpresas,
  getEmpresaById,
  getEmpresaByCuit,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  addPredioToEmpresa,
  removePredioFromEmpresa,
} = require("../controllers/empresaController");

// Rutas específicas (deben ir ANTES de las rutas con parámetros)
router.get("/cuit/:cuit", getEmpresaByCuit);

// Rutas básicas CRUD
router.get("/", getAllEmpresas);
router.get("/:id", getEmpresaById);
router.post("/", createEmpresa);
router.put("/:id", updateEmpresa);
router.delete("/:id", deleteEmpresa);

// Rutas para manejo de predios
router.put("/:id/predios/add", addPredioToEmpresa);
router.put("/:id/predios/remove", removePredioFromEmpresa);

module.exports = router;

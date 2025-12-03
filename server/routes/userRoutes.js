const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  createUserWithJugador,
  createUserWithEmpresa,
  associateUserWithJugador,
  associateUserWithEmpresa,
  associateUserWithPredio,
} = require("../controllers/userController");

// Rutas especiales
router.post("/login", loginUser);
router.post("/complete/jugador", createUserWithJugador);
router.post("/complete/empresa", createUserWithEmpresa);

// Rutas básicas CRUD
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Rutas para asociaciones
router.put("/:id/associate/jugador", associateUserWithJugador);
router.put("/:id/associate/empresa", associateUserWithEmpresa);
router.put("/:id/associate/predio", associateUserWithPredio);

module.exports = router;

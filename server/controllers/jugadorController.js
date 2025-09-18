const Jugador = require("../models/Jugador");

// GET - Obtener todos los jugadores
const getAllJugadores = async (req, res) => {
  try {
    const jugadores = await Jugador.find().populate("reservas");
    res.status(200).json(jugadores);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener jugadores",
      details: error.message,
    });
  }
};

// GET - Obtener jugador por ID
const getJugadorById = async (req, res) => {
  try {
    const jugador = await Jugador.findById(req.params.id).populate("reservas");

    if (!jugador) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    res.status(200).json(jugador);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener jugador",
      details: error.message,
    });
  }
};

// POST - Crear nuevo jugador
const createJugador = async (req, res) => {
  try {
    const { nombre, apellido, nroCelular, reservas } = req.body;

    const newJugador = new Jugador({
      nombre,
      apellido,
      nroCelular,
      reservas: reservas || [],
    });

    const savedJugador = await newJugador.save();
    res.status(201).json(savedJugador);
  } catch (error) {
    res.status(400).json({
      error: "Error al crear jugador",
      details: error.message,
    });
  }
};

// PUT - Actualizar jugador
const updateJugador = async (req, res) => {
  try {
    const updatedJugador = await Jugador.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("reservas");

    if (!updatedJugador) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    res.status(200).json(updatedJugador);
  } catch (error) {
    res.status(400).json({
      error: "Error al actualizar jugador",
      details: error.message,
    });
  }
};

// DELETE - Eliminar jugador
const deleteJugador = async (req, res) => {
  try {
    const deletedJugador = await Jugador.findByIdAndDelete(req.params.id);

    if (!deletedJugador) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    res.status(200).json({ message: "Jugador eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar jugador",
      details: error.message,
    });
  }
};

// PUT - Agregar reserva a jugador
const addReservaToJugador = async (req, res) => {
  try {
    const { reservaId } = req.body;

    const jugador = await Jugador.findByIdAndUpdate(
      req.params.id,
      { $push: { reservas: reservaId } },
      { new: true, runValidators: true }
    ).populate("reservas");

    if (!jugador) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    res.status(200).json(jugador);
  } catch (error) {
    res.status(400).json({
      error: "Error al agregar reserva al jugador",
      details: error.message,
    });
  }
};

// DELETE - Remover reserva de jugador
const removeReservaFromJugador = async (req, res) => {
  try {
    const { reservaId } = req.body;

    const jugador = await Jugador.findByIdAndUpdate(
      req.params.id,
      { $pull: { reservas: reservaId } },
      { new: true, runValidators: true }
    ).populate("reservas");

    if (!jugador) {
      return res.status(404).json({ error: "Jugador no encontrado" });
    }

    res.status(200).json(jugador);
  } catch (error) {
    res.status(400).json({
      error: "Error al remover reserva del jugador",
      details: error.message,
    });
  }
};

module.exports = {
  getAllJugadores,
  getJugadorById,
  createJugador,
  updateJugador,
  deleteJugador,
  addReservaToJugador,
  removeReservaFromJugador,
};

const Cancha = require("../models/Cancha");

// GET - Obtener todas las canchas
const getAllCanchas = async (req, res) => {
  try {
    const canchas = await Cancha.find().populate("predio");
    res.status(200).json(canchas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener canchas",
      details: error.message,
    });
  }
};

// GET - Obtener cancha por ID
const getCanchaById = async (req, res) => {
  try {
    const cancha = await Cancha.findById(req.params.id).populate("predio");

    if (!cancha) {
      return res.status(404).json({ error: "Cancha no encontrada" });
    }

    res.status(200).json(cancha);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener cancha",
      details: error.message,
    });
  }
};

// GET - Obtener canchas por predio
const getCanchasByPredio = async (req, res) => {
  try {
    const canchas = await Cancha.find({ predio: req.params.predioId }).populate(
      "predio"
    );

    res.status(200).json(canchas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener canchas del predio",
      details: error.message,
    });
  }
};

// GET - Buscar canchas disponibles por fecha y hora
const getCanchasDisponibles = async (req, res) => {
  try {
    const { fecha, hora } = req.query;

    if (!fecha || !hora) {
      return res.status(400).json({
        error: "Fecha y hora son requeridas",
      });
    }

    const canchas = await Cancha.find({
      "disponibilidad.fecha": new Date(fecha),
      "disponibilidad.hora": hora,
    }).populate("predio");

    res.status(200).json(canchas);
  } catch (error) {
    res.status(500).json({
      error: "Error al buscar canchas disponibles",
      details: error.message,
    });
  }
};

// GET - Buscar canchas por filtros
const getCanchasByFilters = async (req, res) => {
  try {
    const { cantJugadores, tipoPiso, predioId } = req.query;
    const filters = {};

    if (cantJugadores) filters.cantJugadores = parseInt(cantJugadores);
    if (tipoPiso) filters.tipoPiso = tipoPiso;
    if (predioId) filters.predio = predioId;

    const canchas = await Cancha.find(filters).populate("predio");
    res.status(200).json(canchas);
  } catch (error) {
    res.status(500).json({
      error: "Error al filtrar canchas",
      details: error.message,
    });
  }
};

// POST - Crear nueva cancha
const createCancha = async (req, res) => {
  try {
    const { cantJugadores, tipoPiso, disponibilidad, predio } = req.body;

    // Si el predio viene como string (nombre), buscar por nombre
    let processedPredio = predio;
    if (predio && typeof predio === "string") {
      const Predio = require("../models/Predio");

      // Buscar el predio por nombre (case insensitive)
      const predioEncontrado = await Predio.findOne({
        nombrePredio: { $regex: new RegExp(predio, "i") },
      });

      if (!predioEncontrado) {
        return res.status(400).json({
          error: `No se encontró el predio: ${predio}`,
        });
      }

      // Reemplazar el nombre con el ObjectId
      processedPredio = predioEncontrado._id;
    }

    const newCancha = new Cancha({
      cantJugadores,
      tipoPiso,
      disponibilidad: disponibilidad || [],
      predio: processedPredio,
    });

    const savedCancha = await newCancha.save();
    const populatedCancha = await Cancha.findById(savedCancha._id).populate(
      "predio"
    );

    res.status(201).json(populatedCancha);
  } catch (error) {
    res.status(400).json({
      error: "Error al crear cancha",
      details: error.message,
    });
  }
};

// PUT - Actualizar cancha
const updateCancha = async (req, res) => {
  try {
    const updatedCancha = await Cancha.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("predio");

    if (!updatedCancha) {
      return res.status(404).json({ error: "Cancha no encontrada" });
    }

    res.status(200).json(updatedCancha);
  } catch (error) {
    res.status(400).json({
      error: "Error al actualizar cancha",
      details: error.message,
    });
  }
};

// DELETE - Eliminar cancha
const deleteCancha = async (req, res) => {
  try {
    const deletedCancha = await Cancha.findByIdAndDelete(req.params.id);

    if (!deletedCancha) {
      return res.status(404).json({ error: "Cancha no encontrada" });
    }

    res.status(200).json({ message: "Cancha eliminada correctamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar cancha",
      details: error.message,
    });
  }
};

// PUT - Agregar disponibilidad a cancha
const addDisponibilidadToCancha = async (req, res) => {
  try {
    const { disponibilidad } = req.body;

    const cancha = await Cancha.findByIdAndUpdate(
      req.params.id,
      { $push: { disponibilidad: disponibilidad } },
      { new: true, runValidators: true }
    ).populate("predio");

    if (!cancha) {
      return res.status(404).json({ error: "Cancha no encontrada" });
    }

    res.status(200).json(cancha);
  } catch (error) {
    res.status(400).json({
      error: "Error al agregar disponibilidad a la cancha",
      details: error.message,
    });
  }
};

// DELETE - Remover disponibilidad de cancha
const removeDisponibilidadFromCancha = async (req, res) => {
  try {
    const { disponibilidadId } = req.body;

    const cancha = await Cancha.findByIdAndUpdate(
      req.params.id,
      { $pull: { disponibilidad: { _id: disponibilidadId } } },
      { new: true, runValidators: true }
    ).populate("predio");

    if (!cancha) {
      return res.status(404).json({ error: "Cancha no encontrada" });
    }

    res.status(200).json(cancha);
  } catch (error) {
    res.status(400).json({
      error: "Error al remover disponibilidad de la cancha",
      details: error.message,
    });
  }
};

// PUT - Actualizar disponibilidad específica de cancha
const updateDisponibilidadCancha = async (req, res) => {
  try {
    const { disponibilidadId, newDisponibilidad } = req.body;

    const cancha = await Cancha.findOneAndUpdate(
      {
        _id: req.params.id,
        "disponibilidad._id": disponibilidadId,
      },
      {
        $set: {
          "disponibilidad.$": newDisponibilidad,
        },
      },
      { new: true, runValidators: true }
    ).populate("predio");

    if (!cancha) {
      return res
        .status(404)
        .json({ error: "Cancha o disponibilidad no encontrada" });
    }

    res.status(200).json(cancha);
  } catch (error) {
    res.status(400).json({
      error: "Error al actualizar disponibilidad de la cancha",
      details: error.message,
    });
  }
};

module.exports = {
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
};

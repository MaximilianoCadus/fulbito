const Cancha = require("../models/Cancha");
const Reserva = require("../models/Reserva");

// GET - Obtener todas las canchas
const getAllCanchas = async (req, res) => {
  try {
    const canchas = await Cancha.find().populate({
      path: "predio",
      populate: {
        path: "direccion.localidad",
        model: "Localidad",
      },
    });
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
    const cancha = await Cancha.findById(req.params.id).populate({
      path: "predio",
      populate: {
        path: "direccion.localidad",
        model: "Localidad",
      },
    });

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
      {
        path: "predio",
        populate: {
          path: "direccion.localidad",
          model: "Localidad",
        },
      }
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

    // Parse date string and create consistent date without timezone issues
    const [year, month, day] = fecha.split("-").map(Number);
    const normalizedDate = new Date(year, month - 1, day); // month is 0-indexed in JS

    console.log("Availability check - Original date string:", fecha);
    console.log("Availability check - Parsed components:", {
      year,
      month,
      day,
    });
    console.log(
      "Availability check - Normalized date (local):",
      normalizedDate.toString()
    );
    console.log(
      "Availability check - Normalized date (ISO):",
      normalizedDate.toISOString()
    );
    console.log("Availability check - Hour:", hora);

    // First, find all courts that have availability for this date and time
    const canchasConDisponibilidad = await Cancha.find({
      "disponibilidad.fecha": normalizedDate,
      "disponibilidad.hora": hora,
    }).populate({
      path: "predio",
      populate: {
        path: "direccion.localidad",
        model: "Localidad",
      },
    });

    // Then, find all existing reservations for this date and time
    // that are not cancelled (pending or confirmed reservations block availability)
    const reservasExistentes = await Reserva.find({
      "fechaHora.fecha": normalizedDate,
      "fechaHora.hora": hora,
      estado: { $in: ["pendiente", "confirmada"] },
    }).select("cancha");

    // Get IDs of courts that already have reservations
    const canchasReservadas = reservasExistentes.map((reserva) =>
      reserva.cancha.toString()
    );

    // Filter out courts that already have reservations
    const canchasDisponibles = canchasConDisponibilidad.filter(
      (cancha) => !canchasReservadas.includes(cancha._id.toString())
    );

    console.log(
      `Found ${canchasConDisponibilidad.length} courts with availability slots for ${fecha} at ${hora}`
    );
    console.log(
      `Found ${reservasExistentes.length} existing reservations for this date/time`
    );
    console.log(
      `Filtered out ${canchasReservadas.length} courts with existing reservations`
    );
    console.log(
      `Returning ${canchasDisponibles.length} truly available courts`
    );

    res.status(200).json(canchasDisponibles);
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

    const canchas = await Cancha.find(filters).populate({
      path: "predio",
      populate: {
        path: "direccion.localidad",
        model: "Localidad",
      },
    });
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
    const { numero, cantJugadores, tipoPiso, precio, disponibilidad, predio } =
      req.body;

    // Validate required fields
    if (!numero) {
      return res.status(400).json({
        error: "El número de cancha es requerido",
      });
    }

    if (!cantJugadores) {
      return res.status(400).json({
        error: "La capacidad de jugadores es requerida",
      });
    }

    if (!tipoPiso) {
      return res.status(400).json({
        error: "El tipo de piso es requerido",
      });
    }

    if (precio !== undefined && (precio < 0 || isNaN(precio))) {
      return res.status(400).json({
        error: "El precio debe ser un número válido mayor o igual a 0",
      });
    }

    // Validate and process predio
    let processedPredio = predio;
    if (predio && typeof predio === "string") {
      const Predio = require("../models/Predio");
      const mongoose = require("mongoose");

      // Check if it's a valid ObjectId format
      if (mongoose.Types.ObjectId.isValid(predio)) {
        // If it's a valid ObjectId, verify it exists
        const predioEncontrado = await Predio.findById(predio);

        if (!predioEncontrado) {
          return res.status(400).json({
            error: `No se encontró el predio con ID: ${predio}`,
          });
        }

        processedPredio = predioEncontrado._id;
      } else {
        // If not an ObjectId, treat it as a name and search by name
        const predioEncontrado = await Predio.findOne({
          nombrePredio: { $regex: new RegExp(predio, "i") },
        });

        if (!predioEncontrado) {
          return res.status(400).json({
            error: `No se encontró el predio: ${predio}`,
          });
        }

        processedPredio = predioEncontrado._id;
      }
    }

    // Ensure predio is provided
    if (!processedPredio) {
      return res.status(400).json({
        error: "El predio es requerido",
      });
    }

    // Check if court number already exists for this predio
    const existingCancha = await Cancha.findOne({
      numero: numero,
      predio: processedPredio,
    });

    if (existingCancha) {
      return res.status(400).json({
        error: `Ya existe una cancha con el número ${numero} en este predio`,
      });
    }

    const newCancha = new Cancha({
      numero,
      cantJugadores,
      tipoPiso,
      precio: precio || 30000, // Default to 30000 if not provided
      disponibilidad: disponibilidad || [],
      predio: processedPredio,
    });

    const savedCancha = await newCancha.save();
    const populatedCancha = await Cancha.findById(savedCancha._id).populate({
      path: "predio",
      populate: {
        path: "direccion.localidad",
        model: "Localidad",
      },
    });

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
    ).populate({
      path: "predio",
      populate: {
        path: "direccion.localidad",
        model: "Localidad",
      },
    });

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
    ).populate({
      path: "predio",
      populate: {
        path: "direccion.localidad",
        model: "Localidad",
      },
    });

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
    ).populate({
      path: "predio",
      populate: {
        path: "direccion.localidad",
        model: "Localidad",
      },
    });

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
    ).populate({
      path: "predio",
      populate: {
        path: "direccion.localidad",
        model: "Localidad",
      },
    });

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

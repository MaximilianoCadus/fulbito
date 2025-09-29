const Reserva = require("../models/Reserva");

// GET - Obtener todas las reservas
const getAllReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find()
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });
    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reservas",
      details: error.message,
    });
  }
};

// GET - Obtener reserva por ID
const getReservaById = async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.status(200).json(reserva);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reserva",
      details: error.message,
    });
  }
};

// GET - Obtener reservas por jugador
const getReservasByJugador = async (req, res) => {
  try {
    const reservas = await Reserva.find({ jugador: req.params.jugadorId })
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });

    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reservas del jugador",
      details: error.message,
    });
  }
};

// GET - Obtener reservas por cancha
const getReservasByCancha = async (req, res) => {
  try {
    const reservas = await Reserva.find({ cancha: req.params.canchaId })
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });

    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reservas de la cancha",
      details: error.message,
    });
  }
};

// GET - Obtener reservas por estado
const getReservasByEstado = async (req, res) => {
  try {
    const { estado } = req.params;

    if (!["pendiente", "confirmada", "cancelada"].includes(estado)) {
      return res.status(400).json({
        error: "Estado inválido. Debe ser: pendiente, confirmada o cancelada",
      });
    }

    const reservas = await Reserva.find({ estado })
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });

    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reservas por estado",
      details: error.message,
    });
  }
};

// GET - Obtener reservas por fecha
const getReservasByFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    // Parse date string consistently without timezone issues
    const [year, month, day] = fecha.split("-").map(Number);
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(year, month - 1, day + 1);

    const reservas = await Reserva.find({
      "fechaHora.fecha": {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });

    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener reservas por fecha",
      details: error.message,
    });
  }
};

// POST - Crear nueva reserva
const createReserva = async (req, res) => {
  try {
    const { jugador, cancha, estado, fechaHora, precioFinal } = req.body;

    console.log("Creating reservation request:", {
      jugador,
      cancha,
      fechaHora,
      precioFinal,
      rawBody: req.body,
    });

    // Validate required fields
    if (
      !jugador ||
      !cancha ||
      !fechaHora ||
      !fechaHora.fecha ||
      !fechaHora.hora ||
      !precioFinal
    ) {
      return res.status(400).json({
        error:
          "Datos incompletos. Se requieren: jugador, cancha, fechaHora (fecha y hora), y precioFinal",
      });
    }

    // Parse date string and create consistent date without timezone issues
    // Split the date string to avoid timezone shifts
    const [year, month, day] = fechaHora.fecha.split("-").map(Number);
    const normalizedDate = new Date(year, month - 1, day); // month is 0-indexed in JS

    console.log("Original date string:", fechaHora.fecha);
    console.log("Parsed components:", { year, month, day });
    console.log("Normalized date (local):", normalizedDate.toString());
    console.log("Normalized date (ISO):", normalizedDate.toISOString());
    console.log("Searching for existing reservations with:", {
      cancha,
      fecha: normalizedDate,
      hora: fechaHora.hora,
    });

    // Verificar si ya existe una reserva para la misma cancha, fecha y hora
    const existingReserva = await Reserva.findOne({
      cancha,
      "fechaHora.fecha": normalizedDate,
      "fechaHora.hora": fechaHora.hora,
      estado: { $in: ["pendiente", "confirmada"] },
    });

    if (existingReserva) {
      console.log("Found existing reservation:", existingReserva);
      return res.status(400).json({
        error:
          "Ya existe una reserva para esta cancha en la fecha y hora especificadas",
        existingReservation: {
          id: existingReserva._id,
          fecha: existingReserva.fechaHora.fecha,
          hora: existingReserva.fechaHora.hora,
          estado: existingReserva.estado,
        },
      });
    }

    // Create the reservation with normalized date
    const newReserva = new Reserva({
      jugador,
      cancha,
      estado: estado || "pendiente",
      fechaHora: {
        fecha: normalizedDate,
        hora: fechaHora.hora,
      },
      precioFinal,
    });

    console.log("Creating new reservation:", newReserva);

    const savedReserva = await newReserva.save();
    console.log("Reservation saved successfully:", savedReserva._id);

    const populatedReserva = await Reserva.findById(savedReserva._id)
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });

    res.status(201).json(populatedReserva);
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(400).json({
      error: "Error al crear reserva",
      details: error.message,
    });
  }
};

// PUT - Actualizar reserva
const updateReserva = async (req, res) => {
  try {
    const updatedReserva = await Reserva.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });

    if (!updatedReserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.status(200).json(updatedReserva);
  } catch (error) {
    res.status(400).json({
      error: "Error al actualizar reserva",
      details: error.message,
    });
  }
};

// PUT - Confirmar reserva
const confirmarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findByIdAndUpdate(
      req.params.id,
      { estado: "confirmada" },
      { new: true, runValidators: true }
    )
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.status(200).json(reserva);
  } catch (error) {
    res.status(400).json({
      error: "Error al confirmar reserva",
      details: error.message,
    });
  }
};

// PUT - Cancelar reserva
const cancelarReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findByIdAndUpdate(
      req.params.id,
      { estado: "cancelada" },
      { new: true, runValidators: true }
    )
      .populate("jugador")
      .populate({
        path: "cancha",
        populate: {
          path: "predio",
          model: "Predio",
        },
      });

    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.status(200).json(reserva);
  } catch (error) {
    res.status(400).json({
      error: "Error al cancelar reserva",
      details: error.message,
    });
  }
};

// DELETE - Eliminar reserva
const deleteReserva = async (req, res) => {
  try {
    const deletedReserva = await Reserva.findByIdAndDelete(req.params.id);

    if (!deletedReserva) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    res.status(200).json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar reserva",
      details: error.message,
    });
  }
};

module.exports = {
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
};

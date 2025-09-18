const Reserva = require("../models/Reserva");

// GET - Obtener todas las reservas
const getAllReservas = async (req, res) => {
  try {
    const reservas = await Reserva.find()
      .populate("jugador")
      .populate("cancha");
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
      .populate("cancha");

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
      .populate("cancha");

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
      .populate("cancha");

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
      .populate("cancha");

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
    const startDate = new Date(fecha);
    const endDate = new Date(fecha);
    endDate.setDate(endDate.getDate() + 1);

    const reservas = await Reserva.find({
      "fechaHora.fecha": {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate("jugador")
      .populate("cancha");

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

    // Verificar si ya existe una reserva para la misma cancha, fecha y hora
    const existingReserva = await Reserva.findOne({
      cancha,
      "fechaHora.fecha": fechaHora.fecha,
      "fechaHora.hora": fechaHora.hora,
      estado: { $in: ["pendiente", "confirmada"] },
    });

    if (existingReserva) {
      return res.status(400).json({
        error:
          "Ya existe una reserva para esta cancha en la fecha y hora especificadas",
      });
    }

    const newReserva = new Reserva({
      jugador,
      cancha,
      estado: estado || "pendiente",
      fechaHora,
      precioFinal,
    });

    const savedReserva = await newReserva.save();
    const populatedReserva = await Reserva.findById(savedReserva._id)
      .populate("jugador")
      .populate("cancha");

    res.status(201).json(populatedReserva);
  } catch (error) {
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
      .populate("cancha");

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
      .populate("cancha");

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
      .populate("cancha");

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

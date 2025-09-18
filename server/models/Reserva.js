const mongoose = require("mongoose");

const ReservaSchema = new mongoose.Schema({
  jugador: { type: mongoose.Schema.Types.ObjectId, ref: "Jugador" },
  cancha: { type: mongoose.Schema.Types.ObjectId, ref: "Cancha" },
  estado: {
    type: String,
    required: true,
    enum: ["pendiente", "confirmada", "cancelada"],
    default: "pendiente",
  },
  fechaHora: {
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
  },
  precioFinal: { type: Number, required: true },
});

module.exports = mongoose.model("Reserva", ReservaSchema);

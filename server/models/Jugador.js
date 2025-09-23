const mongoose = require("mongoose");

const JugadorSchema = new mongoose.Schema({
  nombre: { type: String, required: true, maxlength: 50 },
  apellido: { type: String, required: true, maxlength: 50 },
  nroCelular: {
    type: String,
    required: true,
    match: /^\+549\d{10}$/,
    maxlength: 14,
  },
  reservas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reserva" }],
});

module.exports = mongoose.model("Jugador", JugadorSchema);

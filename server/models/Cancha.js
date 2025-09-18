const mongoose = require("mongoose");

const CanchaSchema = new mongoose.Schema({
  cantJugadores: {
    type: Number,
    required: true,
    enum: [5, 6, 7, 8, 9, 11],
  },
  tipoPiso: {
    type: String,
    required: true,
    enum: ["sintetico", "cesped", "salon"],
  },
  disponibilidad: [
    {
      fecha: { type: Date, required: true },
      hora: { type: String, required: true },
      precio: { type: Number, required: true, min: 0 },
    },
  ],
  predio: { type: mongoose.Schema.Types.ObjectId, ref: "Predio" },
});

module.exports = mongoose.model("Cancha", CanchaSchema);

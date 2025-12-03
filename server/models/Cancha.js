const mongoose = require("mongoose");

const CanchaSchema = new mongoose.Schema({
  numero: {
    type: Number,
    required: true,
  },
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
  precio: {
    type: Number,
    required: true,
    min: 0,
    default: 30000,
  },
  predio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Predio",
    required: true,
  },
});

CanchaSchema.index({ numero: 1, predio: 1 }, { unique: true });

module.exports = mongoose.model("Cancha", CanchaSchema);

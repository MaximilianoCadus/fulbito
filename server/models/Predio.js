const mongoose = require("mongoose");
const { direccionSchema } = require("./submodels/Direccion");
const { horarioSchema } = require("./submodels/Horario");

const PredioSchema = new mongoose.Schema({
  nombrePredio: { type: String, required: true, maxlength: 100 },
  direccion: direccionSchema,
  horarios: [horarioSchema],
  canchas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cancha" }],
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: "Empresa" },
});

module.exports = mongoose.model("Predio", PredioSchema);

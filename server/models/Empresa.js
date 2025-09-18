const mongoose = require("mongoose");
const { direccionSchema } = require("./submodels/Direccion");

const EmpresaSchema = new mongoose.Schema({
  cuit: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{11}$/,
  },
  razonSocial: { type: String, required: true, maxlength: 100 },
  direccion: direccionSchema,
  predios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Predio" }],
});

module.exports = mongoose.model("Empresa", EmpresaSchema);

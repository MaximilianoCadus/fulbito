const mongoose = require("mongoose");

const direccionSchema = new mongoose.Schema({
  calle: { type: String, required: true, maxlength: 100 },
  altura: { type: String, required: true, maxlength: 10 },
  piso: { type: String, maxlength: 10 },
  dpto: { type: String, maxlength: 10 },
  localidad: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Localidad",
    required: true,
  },
});

module.exports = {
  direccionSchema,
  Direccion: mongoose.model("Direccion", direccionSchema),
};

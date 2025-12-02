const mongoose = require("mongoose");

const LocalidadSchema = new mongoose.Schema(
  {
    cp: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}$/,
      index: true,
    },
    nombre: {
      type: String,
      required: true,
      maxlength: 100,
    },
  },
  { collection: "localidades" }
);

module.exports = mongoose.model("Localidad", LocalidadSchema);

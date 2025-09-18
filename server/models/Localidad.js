const mongoose = require("mongoose");

const LocalidadSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Localidad", LocalidadSchema);

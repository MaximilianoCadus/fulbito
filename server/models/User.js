const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxlength: 254,
  },
  contraseña: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 60,
  },
  tipoUsuario: {
    type: String,
    required: true,
    enum: ["jugador", "empresa", "predio"],
  },
  jugador: { type: mongoose.Schema.Types.ObjectId, ref: "Jugador" },
  empresa: { type: mongoose.Schema.Types.ObjectId, ref: "Empresa" },
  predio: { type: mongoose.Schema.Types.ObjectId, ref: "Predio" },
});

module.exports = mongoose.model("User", UserSchema);

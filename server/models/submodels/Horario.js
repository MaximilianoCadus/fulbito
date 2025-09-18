const mongoose = require("mongoose");

const horarioSchema = new mongoose.Schema({
  desde: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
  hasta: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
});

module.exports = {
  horarioSchema,
  Horario: mongoose.model("Horario", horarioSchema),
};

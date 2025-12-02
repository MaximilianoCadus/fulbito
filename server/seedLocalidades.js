require("dotenv").config();
const mongoose = require("mongoose");
const Localidad = require("./models/Localidad");

const localidades = [
  { cp: "1000", nombre: "Ciudad Autónoma de Buenos Aires" },
  { cp: "5000", nombre: "Córdoba" },
  { cp: "2000", nombre: "Rosario" },
  { cp: "5500", nombre: "Mendoza" },
  { cp: "4000", nombre: "San Miguel de Tucumán" },
  { cp: "1900", nombre: "La Plata" },
  { cp: "7600", nombre: "Mar del Plata" },
  { cp: "4400", nombre: "Salta" },
  { cp: "3000", nombre: "Santa Fe" },
  { cp: "5400", nombre: "San Juan" },
];

async function seedLocalidades() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✔️ Conectado a MongoDB");

    await Localidad.deleteMany({});

    // Insertar localidades
    for (const loc of localidades) {
      try {
        const exists = await Localidad.findOne({ cp: loc.cp });
        if (exists) {
          console.log(`⚠️ Localidad con CP ${loc.cp} ya existe, omitiendo...`);
        } else {
          await Localidad.create(loc);
          console.log(`✅ Insertada: ${loc.nombre} (CP: ${loc.cp})`);
        }
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⚠️ Localidad con CP ${loc.cp} ya existe (duplicado)`);
        } else {
          console.error(`❌ Error insertando ${loc.nombre}:`, err.message);
        }
      }
    }

    console.log("\n✨ Proceso completado");

    // Cerrar conexión
    await mongoose.connection.close();
    console.log("👋 Conexión cerrada");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

seedLocalidades();

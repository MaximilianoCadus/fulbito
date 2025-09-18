const Localidad = require("../models/Localidad");

// GET - Obtener todas las localidades
const getAllLocalidades = async (req, res) => {
  try {
    const localidades = await Localidad.find().sort({ nombre: 1 });
    res.status(200).json(localidades);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener localidades",
      details: error.message,
    });
  }
};

// GET - Obtener localidad por ID
const getLocalidadById = async (req, res) => {
  try {
    const localidad = await Localidad.findById(req.params.id);

    if (!localidad) {
      return res.status(404).json({ error: "Localidad no encontrada" });
    }

    res.status(200).json(localidad);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener localidad",
      details: error.message,
    });
  }
};

// GET - Obtener localidad por código postal
const getLocalidadByCP = async (req, res) => {
  try {
    const localidad = await Localidad.findOne({ cp: req.params.cp });

    if (!localidad) {
      return res.status(404).json({ error: "Localidad no encontrada" });
    }

    res.status(200).json(localidad);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener localidad",
      details: error.message,
    });
  }
};

// GET - Buscar localidades por nombre (búsqueda parcial)
const searchLocalidadesByNombre = async (req, res) => {
  try {
    const { nombre } = req.query;

    if (!nombre) {
      return res.status(400).json({
        error: "El parámetro nombre es requerido",
      });
    }

    const localidades = await Localidad.find({
      nombre: { $regex: nombre, $options: "i" },
    }).sort({ nombre: 1 });

    res.status(200).json(localidades);
  } catch (error) {
    res.status(500).json({
      error: "Error al buscar localidades",
      details: error.message,
    });
  }
};

// POST - Crear nueva localidad
const createLocalidad = async (req, res) => {
  try {
    const { cp, nombre } = req.body;

    // Verificar si el código postal ya existe
    const existingLocalidad = await Localidad.findOne({ cp });
    if (existingLocalidad) {
      return res.status(400).json({
        error: "El código postal ya está registrado",
      });
    }

    const newLocalidad = new Localidad({
      cp,
      nombre,
    });

    const savedLocalidad = await newLocalidad.save();
    res.status(201).json(savedLocalidad);
  } catch (error) {
    res.status(400).json({
      error: "Error al crear localidad",
      details: error.message,
    });
  }
};

// PUT - Actualizar localidad
const updateLocalidad = async (req, res) => {
  try {
    const updatedLocalidad = await Localidad.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedLocalidad) {
      return res.status(404).json({ error: "Localidad no encontrada" });
    }

    res.status(200).json(updatedLocalidad);
  } catch (error) {
    res.status(400).json({
      error: "Error al actualizar localidad",
      details: error.message,
    });
  }
};

// DELETE - Eliminar localidad
const deleteLocalidad = async (req, res) => {
  try {
    const deletedLocalidad = await Localidad.findByIdAndDelete(req.params.id);

    if (!deletedLocalidad) {
      return res.status(404).json({ error: "Localidad no encontrada" });
    }

    res.status(200).json({ message: "Localidad eliminada correctamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar localidad",
      details: error.message,
    });
  }
};

module.exports = {
  getAllLocalidades,
  getLocalidadById,
  getLocalidadByCP,
  searchLocalidadesByNombre,
  createLocalidad,
  updateLocalidad,
  deleteLocalidad,
};

const Predio = require("../models/Predio");

// GET - Obtener todos los predios
const getAllPredios = async (req, res) => {
  try {
    const predios = await Predio.find()
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");
    res.status(200).json(predios);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener predios",
      details: error.message,
    });
  }
};

// GET - Obtener predio por ID
const getPredioById = async (req, res) => {
  try {
    const predio = await Predio.findById(req.params.id)
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");

    if (!predio) {
      return res.status(404).json({ error: "Predio no encontrado" });
    }

    res.status(200).json(predio);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener predio",
      details: error.message,
    });
  }
};

// GET - Obtener predios por empresa
const getPrediosByEmpresa = async (req, res) => {
  try {
    const predios = await Predio.find({ empresa: req.params.empresaId })
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");

    res.status(200).json(predios);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener predios de la empresa",
      details: error.message,
    });
  }
};

// POST - Crear nuevo predio
const createPredio = async (req, res) => {
  try {
    const { nombrePredio, direccion, horarios, canchas, empresa } = req.body;

    // Si la localidad viene como string (nombre), buscarla en la BD
    let processedDireccion = { ...direccion };
    if (direccion && typeof direccion.localidad === "string") {
      const Localidad = require("../models/Localidad");

      // Buscar la localidad por nombre (case insensitive)
      const localidadEncontrada = await Localidad.findOne({
        nombre: { $regex: new RegExp(direccion.localidad, "i") },
      });

      if (!localidadEncontrada) {
        return res.status(400).json({
          error: `No se encontró la localidad: ${direccion.localidad}`,
        });
      }

      // Reemplazar el nombre con el ObjectId
      processedDireccion.localidad = localidadEncontrada._id;
    }

    // Si la empresa viene como string (CUIT), buscarla en la BD
    let processedEmpresa = empresa;
    if (empresa && typeof empresa === "string") {
      const Empresa = require("../models/Empresa");

      // Buscar la empresa por CUIT
      const empresaEncontrada = await Empresa.findOne({
        cuit: empresa,
      });

      if (!empresaEncontrada) {
        return res.status(400).json({
          error: `No se encontró la empresa con CUIT: ${empresa}`,
        });
      }

      // Reemplazar el CUIT con el ObjectId
      processedEmpresa = empresaEncontrada._id;
    }

    const newPredio = new Predio({
      nombrePredio,
      direccion: processedDireccion,
      horarios: horarios || [],
      canchas: canchas || [],
      empresa: processedEmpresa,
    });

    const savedPredio = await newPredio.save();
    const populatedPredio = await Predio.findById(savedPredio._id)
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");

    res.status(201).json(populatedPredio);
  } catch (error) {
    res.status(400).json({
      error: "Error al crear predio",
      details: error.message,
    });
  }
};

// PUT - Actualizar predio
const updatePredio = async (req, res) => {
  try {
    const updatedPredio = await Predio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");

    if (!updatedPredio) {
      return res.status(404).json({ error: "Predio no encontrado" });
    }

    res.status(200).json(updatedPredio);
  } catch (error) {
    res.status(400).json({
      error: "Error al actualizar predio",
      details: error.message,
    });
  }
};

// DELETE - Eliminar predio
const deletePredio = async (req, res) => {
  try {
    const deletedPredio = await Predio.findByIdAndDelete(req.params.id);

    if (!deletedPredio) {
      return res.status(404).json({ error: "Predio no encontrado" });
    }

    res.status(200).json({ message: "Predio eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar predio",
      details: error.message,
    });
  }
};

// PUT - Agregar cancha a predio
const addCanchaToPredio = async (req, res) => {
  try {
    const { canchaId } = req.body;

    const predio = await Predio.findByIdAndUpdate(
      req.params.id,
      { $push: { canchas: canchaId } },
      { new: true, runValidators: true }
    )
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");

    if (!predio) {
      return res.status(404).json({ error: "Predio no encontrado" });
    }

    res.status(200).json(predio);
  } catch (error) {
    res.status(400).json({
      error: "Error al agregar cancha al predio",
      details: error.message,
    });
  }
};

// DELETE - Remover cancha de predio
const removeCanchaFromPredio = async (req, res) => {
  try {
    const { canchaId } = req.body;

    const predio = await Predio.findByIdAndUpdate(
      req.params.id,
      { $pull: { canchas: canchaId } },
      { new: true, runValidators: true }
    )
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");

    if (!predio) {
      return res.status(404).json({ error: "Predio no encontrado" });
    }

    res.status(200).json(predio);
  } catch (error) {
    res.status(400).json({
      error: "Error al remover cancha del predio",
      details: error.message,
    });
  }
};

// PUT - Agregar horario a predio
const addHorarioToPredio = async (req, res) => {
  try {
    const { horario } = req.body;

    const predio = await Predio.findByIdAndUpdate(
      req.params.id,
      { $push: { horarios: horario } },
      { new: true, runValidators: true }
    )
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");

    if (!predio) {
      return res.status(404).json({ error: "Predio no encontrado" });
    }

    res.status(200).json(predio);
  } catch (error) {
    res.status(400).json({
      error: "Error al agregar horario al predio",
      details: error.message,
    });
  }
};

// DELETE - Remover horario de predio
const removeHorarioFromPredio = async (req, res) => {
  try {
    const { horarioId } = req.body;

    const predio = await Predio.findByIdAndUpdate(
      req.params.id,
      { $pull: { horarios: { _id: horarioId } } },
      { new: true, runValidators: true }
    )
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");

    if (!predio) {
      return res.status(404).json({ error: "Predio no encontrado" });
    }

    res.status(200).json(predio);
  } catch (error) {
    res.status(400).json({
      error: "Error al remover horario del predio",
      details: error.message,
    });
  }
};

module.exports = {
  getAllPredios,
  getPredioById,
  getPrediosByEmpresa,
  createPredio,
  updatePredio,
  deletePredio,
  addCanchaToPredio,
  removeCanchaFromPredio,
  addHorarioToPredio,
  removeHorarioFromPredio,
};

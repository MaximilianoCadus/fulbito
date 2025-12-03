const Empresa = require("../models/Empresa");

// GET - Obtener todas las empresas
const getAllEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.find()
      .populate("predios")
      .populate("direccion.localidad");
    res.status(200).json(empresas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener empresas",
      details: error.message,
    });
  }
};

// GET - Obtener empresa por ID
const getEmpresaById = async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.params.id)
      .populate("predios")
      .populate("direccion.localidad");

    if (!empresa) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.status(200).json(empresa);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener empresa",
      details: error.message,
    });
  }
};

// GET - Obtener empresa por CUIT
const getEmpresaByCuit = async (req, res) => {
  try {
    const empresa = await Empresa.findOne({ cuit: req.params.cuit })
      .populate("predios")
      .populate("direccion.localidad");

    if (!empresa) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.status(200).json(empresa);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener empresa",
      details: error.message,
    });
  }
};

// POST - Crear nueva empresa
const createEmpresa = async (req, res) => {
  try {
    const { cuit, razonSocial, direccion, predios } = req.body;

    const existingEmpresa = await Empresa.findOne({ cuit });
    if (existingEmpresa) {
      return res.status(400).json({ error: "El CUIT ya está registrado" });
    }

    let processedDireccion = { ...direccion };
    if (direccion && typeof direccion.localidad === "string") {
      const Localidad = require("../models/Localidad");

      const localidadEncontrada = await Localidad.findOne({
        nombre: { $regex: new RegExp(direccion.localidad, "i") },
      });

      if (!localidadEncontrada) {
        return res.status(400).json({
          error: `No se encontró la localidad: ${direccion.localidad}`,
        });
      }

      processedDireccion.localidad = localidadEncontrada._id;
    }

    const newEmpresa = new Empresa({
      cuit,
      razonSocial,
      direccion: processedDireccion,
      predios: predios || [],
    });

    const savedEmpresa = await newEmpresa.save();
    const populatedEmpresa = await Empresa.findById(savedEmpresa._id)
      .populate("predios")
      .populate("direccion.localidad");

    res.status(201).json(populatedEmpresa);
  } catch (error) {
    res.status(400).json({
      error: "Error al crear empresa",
      details: error.message,
    });
  }
};

// PUT - Actualizar empresa
const updateEmpresa = async (req, res) => {
  try {
    console.log("Updating empresa with ID:", req.params.id);
    console.log("Update data received:", JSON.stringify(req.body, null, 2));

    let updateData = { ...req.body };

    if (updateData.direccion) {
      if (
        typeof updateData.direccion.localidad === "string" &&
        updateData.direccion.localidad.trim()
      ) {
        const Localidad = require("../models/Localidad");

        const localidadEncontrada = await Localidad.findOne({
          nombre: {
            $regex: new RegExp(updateData.direccion.localidad.trim(), "i"),
          },
        });

        if (!localidadEncontrada) {
          return res.status(400).json({
            error: `No se encontró la localidad: ${updateData.direccion.localidad}`,
          });
        }

        updateData.direccion.localidad = localidadEncontrada._id;
      } else if (
        !updateData.direccion.localidad ||
        updateData.direccion.localidad === null
      ) {
        const empresaOriginal = await Empresa.findById(req.params.id);
        if (
          empresaOriginal &&
          empresaOriginal.direccion &&
          empresaOriginal.direccion.localidad
        ) {
          updateData.direccion.localidad = empresaOriginal.direccion.localidad;
        } else {
          return res.status(400).json({
            error: "La localidad es requerida para la dirección",
          });
        }
      }
    }

    console.log("Final update data:", JSON.stringify(updateData, null, 2));

    const updatedEmpresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("predios")
      .populate("direccion.localidad");

    if (!updatedEmpresa) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    console.log("Empresa updated successfully:", updatedEmpresa._id);
    res.status(200).json(updatedEmpresa);
  } catch (error) {
    console.error("Error updating empresa:", error);
    res.status(400).json({
      error: "Error al actualizar empresa",
      details: error.message,
    });
  }
};

// DELETE - Eliminar empresa
const deleteEmpresa = async (req, res) => {
  try {
    const deletedEmpresa = await Empresa.findByIdAndDelete(req.params.id);

    if (!deletedEmpresa) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.status(200).json({ message: "Empresa eliminada correctamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar empresa",
      details: error.message,
    });
  }
};

// PUT - Agregar predio a empresa
const addPredioToEmpresa = async (req, res) => {
  try {
    const { predioId } = req.body;

    const empresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      { $push: { predios: predioId } },
      { new: true, runValidators: true }
    )
      .populate("predios")
      .populate("direccion.localidad");

    if (!empresa) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.status(200).json(empresa);
  } catch (error) {
    res.status(400).json({
      error: "Error al agregar predio a la empresa",
      details: error.message,
    });
  }
};

// DELETE - Remover predio de empresa
const removePredioFromEmpresa = async (req, res) => {
  try {
    const { predioId } = req.body;

    const empresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      { $pull: { predios: predioId } },
      { new: true, runValidators: true }
    )
      .populate("predios")
      .populate("direccion.localidad");

    if (!empresa) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.status(200).json(empresa);
  } catch (error) {
    res.status(400).json({
      error: "Error al remover predio de la empresa",
      details: error.message,
    });
  }
};

module.exports = {
  getAllEmpresas,
  getEmpresaById,
  getEmpresaByCuit,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  addPredioToEmpresa,
  removePredioFromEmpresa,
};

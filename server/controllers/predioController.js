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

    // Get user information for each predio
    const User = require("../models/User");
    const prediosWithUserInfo = await Promise.all(
      predios.map(async (predio) => {
        const predioObj = predio.toObject();

        // Find associated user
        const user = await User.findOne({
          predio: predio._id,
          tipoUsuario: "predio",
        }).select("email");

        if (user) {
          predioObj.userEmail = user.email;
        }

        return predioObj;
      })
    );

    res.status(200).json(prediosWithUserInfo);
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
    const {
      nombrePredio,
      direccion,
      horarios,
      canchas,
      empresa,
      email,
      password,
    } = req.body;

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

    // Create user account for the venue if email and password are provided
    if (email && password) {
      const User = require("../models/User");
      const bcrypt = require("bcrypt");

      // Check if user with this email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // If user already exists, delete the created predio and return error
        await Predio.findByIdAndDelete(savedPredio._id);
        return res.status(409).json({
          error: "Ya existe un usuario con este email",
        });
      }

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create the user account
      const newUser = new User({
        email,
        contraseña: hashedPassword,
        tipoUsuario: "predio",
        predio: savedPredio._id,
      });

      await newUser.save();
      console.log(`Created user account for venue: ${email}`);
    }

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
    console.log(
      "UPDATE PREDIO - Request body:",
      JSON.stringify(req.body, null, 2)
    );
    console.log("UPDATE PREDIO - Predio ID:", req.params.id);

    const { nombrePredio, direccion, horarios, canchas, empresa } = req.body;

    // Preparar datos para actualización
    let updateData = {};

    if (nombrePredio !== undefined) {
      updateData.nombrePredio = nombrePredio;
    }

    if (horarios !== undefined) {
      updateData.horarios = horarios;
    }

    if (canchas !== undefined) {
      updateData.canchas = canchas;
    }

    // Si hay direccion, procesarla
    if (direccion) {
      let processedDireccion = { ...direccion };

      // Si la localidad viene como string (nombre), buscarla en la BD
      if (direccion.localidad && typeof direccion.localidad === "string") {
        const Localidad = require("../models/Localidad");

        console.log("UPDATE PREDIO - Buscando localidad:", direccion.localidad);

        // Buscar la localidad por nombre (case insensitive)
        const localidadEncontrada = await Localidad.findOne({
          nombre: { $regex: new RegExp(direccion.localidad, "i") },
        });

        if (!localidadEncontrada) {
          console.log(
            "UPDATE PREDIO - Localidad no encontrada:",
            direccion.localidad
          );
          return res.status(400).json({
            error: `No se encontró la localidad: ${direccion.localidad}`,
          });
        }

        console.log(
          "UPDATE PREDIO - Localidad encontrada:",
          localidadEncontrada
        );
        // Reemplazar el nombre con el ObjectId
        processedDireccion.localidad = localidadEncontrada._id;
      }

      updateData.direccion = processedDireccion;
    }

    // Si la empresa viene como string (CUIT), buscarla en la BD
    if (empresa && typeof empresa === "string") {
      const Empresa = require("../models/Empresa");

      console.log("UPDATE PREDIO - Buscando empresa por CUIT:", empresa);

      // Buscar la empresa por CUIT
      const empresaEncontrada = await Empresa.findOne({
        cuit: empresa,
      });

      if (!empresaEncontrada) {
        console.log("UPDATE PREDIO - Empresa no encontrada:", empresa);
        return res.status(400).json({
          error: `No se encontró la empresa con CUIT: ${empresa}`,
        });
      }

      console.log("UPDATE PREDIO - Empresa encontrada:", empresaEncontrada._id);
      updateData.empresa = empresaEncontrada._id;
    } else if (empresa) {
      updateData.empresa = empresa;
    }

    console.log(
      "UPDATE PREDIO - Final update data:",
      JSON.stringify(updateData, null, 2)
    );

    const updatedPredio = await Predio.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("canchas")
      .populate("empresa")
      .populate("direccion.localidad");

    if (!updatedPredio) {
      console.log(
        "UPDATE PREDIO - Predio no encontrado con ID:",
        req.params.id
      );
      return res.status(404).json({ error: "Predio no encontrado" });
    }

    console.log(
      "UPDATE PREDIO - Predio actualizado exitosamente:",
      updatedPredio._id
    );
    res.status(200).json(updatedPredio);
  } catch (error) {
    console.error("UPDATE PREDIO - Error:", error);
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

// PUT - Update predio user credentials
const updatePredioCredentials = async (req, res) => {
  try {
    const { email, password } = req.body;
    const predioId = req.params.id;

    console.log("UPDATE CREDENTIALS - Predio ID:", predioId);
    console.log("UPDATE CREDENTIALS - New email:", email);

    // Validate inputs
    if (!email || !email.trim()) {
      return res.status(400).json({
        error: "El email es obligatorio",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Formato de email inválido",
      });
    }

    // Find the venue
    const predio = await Predio.findById(predioId);
    if (!predio) {
      return res.status(404).json({ error: "Predio no encontrado" });
    }

    const User = require("../models/User");
    const bcrypt = require("bcrypt");

    // Find the associated user
    const user = await User.findOne({
      predio: predioId,
      tipoUsuario: "predio",
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuario asociado al predio no encontrado",
      });
    }

    // Check if the new email is already taken by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          error: "Ya existe un usuario con este email",
        });
      }
    }

    // Prepare update data
    const updateData = { email };

    // Only update password if it's provided
    if (password && password.trim()) {
      if (password.length < 8) {
        return res.status(400).json({
          error: "La contraseña debe tener al menos 8 caracteres",
        });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.contraseña = hashedPassword;
    }

    // Update the user
    await User.findByIdAndUpdate(user._id, updateData, {
      new: true,
      runValidators: true,
    });

    console.log("UPDATE CREDENTIALS - Successfully updated user credentials");

    res.status(200).json({
      message: "Credenciales actualizadas correctamente",
      email: updateData.email,
    });
  } catch (error) {
    console.error("UPDATE CREDENTIALS - Error:", error);
    res.status(500).json({
      error: "Error al actualizar credenciales",
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
  updatePredioCredentials,
};

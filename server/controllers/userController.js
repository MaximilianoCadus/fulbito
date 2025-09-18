const User = require("../models/User");
const bcrypt = require("bcrypt");

// GET - Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("jugador")
      .populate("empresa")
      .populate("predio")
      .select("-contraseña");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener usuarios",
      details: error.message,
    });
  }
};

// GET - Obtener usuario por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("jugador")
      .populate("empresa")
      .populate("predio")
      .select("-contraseña");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener usuario",
      details: error.message,
    });
  }
};

// POST - Crear nuevo usuario
const createUser = async (req, res) => {
  try {
    const { email, contraseña, tipoUsuario, jugador, empresa, predio } =
      req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const newUser = new User({
      email,
      contraseña: hashedPassword,
      tipoUsuario,
      jugador,
      empresa,
      predio,
    });

    const savedUser = await newUser.save();

    // Retornar usuario sin contraseña
    const userResponse = await User.findById(savedUser._id)
      .populate("jugador")
      .populate("empresa")
      .populate("predio")
      .select("-contraseña");

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({
      error: "Error al crear usuario",
      details: error.message,
    });
  }
};

// PUT - Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { contraseña, ...updateData } = req.body;

    // Si se proporciona nueva contraseña, encriptarla
    if (contraseña) {
      updateData.contraseña = await bcrypt.hash(contraseña, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("jugador")
      .populate("empresa")
      .populate("predio")
      .select("-contraseña");

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({
      error: "Error al actualizar usuario",
      details: error.message,
    });
  }
};

// DELETE - Eliminar usuario
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al eliminar usuario",
      details: error.message,
    });
  }
};

// POST - Crear usuario completo con jugador
const createUserWithJugador = async (req, res) => {
  try {
    const { email, contraseña, nombre, apellido, nroCelular } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // Crear jugador primero
    const Jugador = require("../models/Jugador");
    const newJugador = new Jugador({
      nombre,
      apellido,
      nroCelular,
    });
    const savedJugador = await newJugador.save();

    // Crear usuario con referencia al jugador
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const newUser = new User({
      email,
      contraseña: hashedPassword,
      tipoUsuario: "jugador",
      jugador: savedJugador._id,
    });

    const savedUser = await newUser.save();
    const userResponse = await User.findById(savedUser._id)
      .populate("jugador")
      .select("-contraseña");

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({
      error: "Error al crear usuario con jugador",
      details: error.message,
    });
  }
};

// POST - Crear usuario completo con empresa
const createUserWithEmpresa = async (req, res) => {
  try {
    const { email, contraseña, cuit, razonSocial, direccion } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

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

    // Crear empresa primero
    const Empresa = require("../models/Empresa");
    const newEmpresa = new Empresa({
      cuit,
      razonSocial,
      direccion: processedDireccion,
    });
    const savedEmpresa = await newEmpresa.save();

    // Crear usuario con referencia a la empresa
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const newUser = new User({
      email,
      contraseña: hashedPassword,
      tipoUsuario: "empresa",
      empresa: savedEmpresa._id,
    });

    const savedUser = await newUser.save();
    const userResponse = await User.findById(savedUser._id)
      .populate("empresa")
      .select("-contraseña");

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({
      error: "Error al crear usuario con empresa",
      details: error.message,
    });
  }
};

// PUT - Asociar usuario existente con jugador
const associateUserWithJugador = async (req, res) => {
  try {
    const { jugadorId } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        jugador: jugadorId,
        tipoUsuario: "jugador",
      },
      { new: true, runValidators: true }
    )
      .populate("jugador")
      .select("-contraseña");

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({
      error: "Error al asociar usuario con jugador",
      details: error.message,
    });
  }
};

// PUT - Asociar usuario existente con empresa
const associateUserWithEmpresa = async (req, res) => {
  try {
    const { empresaId } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        empresa: empresaId,
        tipoUsuario: "empresa",
      },
      { new: true, runValidators: true }
    )
      .populate("empresa")
      .select("-contraseña");

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({
      error: "Error al asociar usuario con empresa",
      details: error.message,
    });
  }
};

// PUT - Asociar usuario existente con predio
const associateUserWithPredio = async (req, res) => {
  try {
    const { predioId } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        predio: predioId,
        tipoUsuario: "predio",
      },
      { new: true, runValidators: true }
    )
      .populate("predio")
      .select("-contraseña");

    if (!updatedUser) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({
      error: "Error al asociar usuario con predio",
      details: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  createUserWithJugador,
  createUserWithEmpresa,
  associateUserWithJugador,
  associateUserWithEmpresa,
  associateUserWithPredio,
};

const User = require("../models/User");
const bcrypt = require("bcrypt");

// POST - Login user
const loginUser = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    console.log(`[USER-LOGIN] Login attempt for email: ${email}`);

    if (!email || !contraseña) {
      console.log(`[USER-LOGIN] Missing required fields:`, {
        email: !!email,
        contraseña: !!contraseña,
      });
      return res.status(400).json({
        error: "Email y contraseña son requeridos",
        code: "MISSING_CREDENTIALS",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .populate("jugador")
      .populate("empresa")
      .populate("predio");

    if (!user) {
      console.log(`[USER-LOGIN] User not found for email: ${email}`);
      return res.status(401).json({
        error: "Email o contraseña incorrectos",
        code: "INVALID_CREDENTIALS",
      });
    }

    const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    if (!isPasswordValid) {
      console.log(`[USER-LOGIN] Invalid password for email: ${email}`);
      return res.status(401).json({
        error: "Email o contraseña incorrectos",
        code: "INVALID_CREDENTIALS",
      });
    }

    console.log(`[USER-LOGIN] Login successful for user:`, {
      userId: user._id,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
    });

    const userResponse = {
      _id: user._id,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
      jugador: user.jugador,
      empresa: user.empresa,
      predio: user.predio,
    };

    res.status(200).json({
      message: "Login exitoso",
      user: userResponse,
    });
  } catch (error) {
    console.error(`[USER-LOGIN] Error during login:`, error);
    res.status(500).json({
      error: "Error interno del servidor",
      code: "INTERNAL_SERVER_ERROR",
      details: error.message,
    });
  }
};

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
      .select("_id email tipoUsuario jugador empresa predio __v");

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const Jugador = require("../models/Jugador");
    const newJugador = new Jugador({
      nombre,
      apellido,
      nroCelular,
    });
    const savedJugador = await newJugador.save();

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

    console.log(
      `[USER-EMPRESA] Starting company user creation for email: ${email}`
    );
    console.log(`[USER-EMPRESA] Email details:`, {
      originalEmail: email,
      emailType: typeof email,
      emailLength: email ? email.length : 0,
      emailTrimmed: email ? email.trim() : null,
      emailLowerCase: email ? email.toLowerCase() : null,
    });
    console.log(`[USER-EMPRESA] Request data:`, {
      email,
      cuit,
      razonSocial,
      direccion: direccion
        ? {
            calle: direccion.calle,
            altura: direccion.altura,
            piso: direccion.piso,
            dpto: direccion.dpto,
            localidad: direccion.localidad,
          }
        : null,
    });

    if (!email || !contraseña || !cuit || !razonSocial || !direccion) {
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!contraseña) missingFields.push("contraseña");
      if (!cuit) missingFields.push("cuit");
      if (!razonSocial) missingFields.push("razonSocial");
      if (!direccion) missingFields.push("direccion");

      console.log(
        `[USER-EMPRESA] Missing required fields: ${missingFields.join(", ")}`
      );
      return res.status(400).json({
        error: `Faltan campos requeridos: ${missingFields.join(", ")}`,
        code: "MISSING_FIELDS",
        missingFields,
      });
    }

    if (!direccion.calle || !direccion.altura || !direccion.localidad) {
      const missingAddressFields = [];
      if (!direccion.calle) missingAddressFields.push("calle");
      if (!direccion.altura) missingAddressFields.push("altura");
      if (!direccion.localidad) missingAddressFields.push("localidad");

      console.log(
        `[USER-EMPRESA] Missing address fields: ${missingAddressFields.join(
          ", "
        )}`
      );
      return res.status(400).json({
        error: `Faltan campos de dirección: ${missingAddressFields.join(", ")}`,
        code: "MISSING_ADDRESS_FIELDS",
        missingFields: missingAddressFields,
      });
    }

    console.log(`[USER-EMPRESA] Checking if email exists: ${email}`);
    console.log(`[USER-EMPRESA] Email query: { email: "${email}" }`);

    try {
      const allUsers = await User.find({}, { email: 1, _id: 1 }).limit(20);
      console.log(
        `[USER-EMPRESA] Existing emails in database:`,
        allUsers.map((u) => u.email)
      );

      const existingUser = await User.findOne({ email: email });
      console.log(
        `[USER-EMPRESA] Exact match query result:`,
        existingUser
          ? {
              id: existingUser._id,
              email: existingUser.email,
              tipoUsuario: existingUser.tipoUsuario,
            }
          : null
      );

      const existingUserCaseInsensitive = await User.findOne({
        email: {
          $regex: new RegExp(
            `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
            "i"
          ),
        },
      });
      console.log(
        `[USER-EMPRESA] Case-insensitive match query result:`,
        existingUserCaseInsensitive
          ? {
              id: existingUserCaseInsensitive._id,
              email: existingUserCaseInsensitive.email,
              tipoUsuario: existingUserCaseInsensitive.tipoUsuario,
            }
          : null
      );

      if (existingUser || existingUserCaseInsensitive) {
        const foundUser = existingUser || existingUserCaseInsensitive;
        console.log(
          `[USER-EMPRESA] Email already exists: ${email} (found: ${foundUser.email})`
        );
        return res.status(409).json({
          error: "El email ya está registrado. Por favor, utiliza otro email.",
          code: "EMAIL_EXISTS",
          existingEmail: foundUser.email,
        });
      }

      console.log(`[USER-EMPRESA] Email is available: ${email}`);
    } catch (emailCheckError) {
      console.error(
        `[USER-EMPRESA] Error checking email existence:`,
        emailCheckError
      );
      return res.status(500).json({
        error: "Error interno al verificar el email",
        code: "EMAIL_CHECK_ERROR",
        details: emailCheckError.message,
      });
    }

    console.log(`[USER-EMPRESA] Checking if CUIT exists: ${cuit}`);
    const Empresa = require("../models/Empresa");
    const existingEmpresa = await Empresa.findOne({ cuit });
    if (existingEmpresa) {
      console.log(`[USER-EMPRESA] CUIT already exists: ${cuit}`);
      return res.status(409).json({
        error:
          "El CUIT ya está registrado. Una empresa con este CUIT ya existe en el sistema.",
        code: "CUIT_EXISTS",
      });
    }

    let processedDireccion = { ...direccion };
    if (direccion && typeof direccion.localidad === "string") {
      console.log(`[USER-EMPRESA] Looking up locality: ${direccion.localidad}`);
      const Localidad = require("../models/Localidad");

      const localidadEncontrada = await Localidad.findOne({
        nombre: { $regex: new RegExp(direccion.localidad, "i") },
      });

      if (!localidadEncontrada) {
        console.log(
          `[USER-EMPRESA] Locality not found: ${direccion.localidad}`
        );
        const similarLocalidades = await Localidad.find({
          nombre: { $regex: new RegExp(direccion.localidad, "i") },
        }).limit(3);

        return res.status(400).json({
          error: `No se encontró la localidad: "${direccion.localidad}". Verifica que el nombre esté correcto.`,
          code: "LOCALITY_NOT_FOUND",
          searchedLocality: direccion.localidad,
          suggestions: similarLocalidades.map((loc) => loc.nombre),
        });
      }

      console.log(
        `[USER-EMPRESA] Locality found: ${localidadEncontrada.nombre} (ID: ${localidadEncontrada._id})`
      );
      processedDireccion.localidad = localidadEncontrada._id;
    }

    console.log(`[USER-EMPRESA] Creating empresa with processed data`);
    const newEmpresa = new Empresa({
      cuit,
      razonSocial,
      direccion: processedDireccion,
    });

    let savedEmpresa;
    try {
      savedEmpresa = await newEmpresa.save();
      console.log(
        `[USER-EMPRESA] Empresa created successfully with ID: ${savedEmpresa._id}`
      );
    } catch (empresaError) {
      console.error(`[USER-EMPRESA] Error creating empresa:`, empresaError);

      if (empresaError.name === "ValidationError") {
        const validationErrors = Object.keys(empresaError.errors).map(
          (field) => {
            const error = empresaError.errors[field];
            return `${field}: ${error.message}`;
          }
        );

        return res.status(400).json({
          error: "Error de validación en los datos de la empresa",
          code: "EMPRESA_VALIDATION_ERROR",
          validationErrors,
          details: empresaError.message,
        });
      }

      if (empresaError.code === 11000) {
        const field = Object.keys(empresaError.keyPattern)[0];
        return res.status(409).json({
          error: `El ${field} ya está registrado en el sistema`,
          code: "EMPRESA_DUPLICATE_KEY",
          duplicateField: field,
        });
      }

      throw empresaError;
    }

    console.log(`[USER-EMPRESA] Creating user account for empresa`);
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(contraseña, 10);
    } catch (hashError) {
      console.error(`[USER-EMPRESA] Error hashing password:`, hashError);
      return res.status(500).json({
        error: "Error interno al procesar la contraseña",
        code: "PASSWORD_HASH_ERROR",
      });
    }

    const newUser = new User({
      email,
      contraseña: hashedPassword,
      tipoUsuario: "empresa",
      empresa: savedEmpresa._id,
    });

    let savedUser;
    try {
      savedUser = await newUser.save();
      console.log(
        `[USER-EMPRESA] User created successfully with ID: ${savedUser._id}`
      );
    } catch (userError) {
      console.error(`[USER-EMPRESA] Error creating user:`, userError);

      try {
        await Empresa.findByIdAndDelete(savedEmpresa._id);
        console.log(
          `[USER-EMPRESA] Cleaned up empresa after user creation failure`
        );
      } catch (cleanupError) {
        console.error(
          `[USER-EMPRESA] Error cleaning up empresa:`,
          cleanupError
        );
      }

      if (userError.name === "ValidationError") {
        const validationErrors = Object.keys(userError.errors).map((field) => {
          const error = userError.errors[field];
          return `${field}: ${error.message}`;
        });

        return res.status(400).json({
          error: "Error de validación en los datos del usuario",
          code: "USER_VALIDATION_ERROR",
          validationErrors,
          details: userError.message,
        });
      }

      if (userError.code === 11000) {
        return res.status(409).json({
          error: "El email ya está registrado (verificación final)",
          code: "USER_EMAIL_EXISTS",
        });
      }

      throw userError;
    }

    console.log(`[USER-EMPRESA] Fetching complete user data`);
    const userResponse = await User.findById(savedUser._id)
      .populate("empresa")
      .select("-contraseña");

    console.log(
      `[USER-EMPRESA] Company user creation completed successfully for: ${email}`
    );
    res.status(201).json(userResponse);
  } catch (error) {
    console.error(
      `[USER-EMPRESA] Unexpected error during company user creation:`,
      {
        message: error.message,
        stack: error.stack,
        name: error.name,
      }
    );

    res.status(500).json({
      error: "Error interno del servidor al crear usuario empresa",
      code: "INTERNAL_SERVER_ERROR",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Contacta al administrador del sistema",
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
  loginUser,
  createUserWithJugador,
  createUserWithEmpresa,
  associateUserWithJugador,
  associateUserWithEmpresa,
  associateUserWithPredio,
};

// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  console.error("❌ Error:", err);

  // Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    return res.status(400).json({
      success: false,
      error: "Error de validación",
      details: message,
    });
  }

  // Error de duplicado de Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `El ${field} ya existe`;
    return res.status(400).json({
      success: false,
      error: "Recurso duplicado",
      details: message,
    });
  }

  // Error de ID inválido de Mongoose
  if (err.name === "CastError") {
    const message = "ID de recurso inválido";
    return res.status(404).json({
      success: false,
      error: message,
    });
  }

  // Error por defecto
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Error interno del servidor",
  });
};

module.exports = errorHandler;

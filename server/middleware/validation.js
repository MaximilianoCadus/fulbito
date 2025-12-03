// Middleware para verificar resultados de validación (sin express-validator por ahora)
const checkValidationResult = (req, res, next) => {
  // Por ahora solo pasa al siguiente middleware
  next();
};

module.exports = checkValidationResult;

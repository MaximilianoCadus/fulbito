// Middleware para verificar resultados de validación (sin express-validator por ahora)
const checkValidationResult = (req, res, next) => {
  // Por ahora solo pasa al siguiente middleware
  // Podemos implementar validación manual aquí si es necesario
  next();
};

module.exports = checkValidationResult;

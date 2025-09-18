// Middleware para logging de requests
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Log del body para POST y PUT (sin datos sensibles)
  if ((method === "POST" || method === "PUT") && req.body) {
    const logBody = { ...req.body };
    // Ocultar contraseñas en logs
    if (logBody.contraseña) {
      logBody.contraseña = "***";
    }
    console.log(`[${timestamp}] Body:`, logBody);
  }

  next();
};

module.exports = requestLogger;

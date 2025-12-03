const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  if ((method === "POST" || method === "PUT") && req.body) {
    const logBody = { ...req.body };
    if (logBody.contraseña) {
      logBody.contraseña = "***";
    }
    console.log(`[${timestamp}] Body:`, logBody);
  }

  next();
};

module.exports = requestLogger;

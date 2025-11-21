const requestLogger = (req, res, next) => {
  console.log(`🚀 REQUEST: ${req.method} ${req.url} from ${req.headers.origin || 'no-origin'}`);
  next();
};

const corsMiddleware = (req, res, next) => {
  console.log(`🔧 CORS Middleware: Processing ${req.method} ${req.url}`);

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS: Handling OPTIONS preflight for ${req.url}`);
    res.status(200).end();
    return;
  }

  console.log(`➡️ CORS: Passing through ${req.method} ${req.url}`);
  next();
};

module.exports = { requestLogger, corsMiddleware };
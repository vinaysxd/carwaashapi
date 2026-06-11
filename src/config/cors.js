const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:19006', 
  'http://localhost:3001',
  'http://localhost:3002'
];

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
      }
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = corsOptions;

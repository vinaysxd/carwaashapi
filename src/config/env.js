if (!process.env.PORT) {
  require('dotenv').config();
}

const required = [
  'PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'SUPABASE_PROJECT_URL',
  'SUPA_BASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'FAST2SMS_API_KEY',
  'RESEND_API_KEY',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('Missing required environment variables:', missing);
  process.exit(1);
}

console.log('All environment variables validated successfully');

module.exports = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  supabaseUrl: process.env.SUPABASE_PROJECT_URL,
  supabaseKey: process.env.SUPA_BASE_SERVICE_ROLE_KEY,
  databaseUrl: process.env.DATABASE_URL,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  fast2smsKey: process.env.FAST2SMS_API_KEY,
  resendKey: process.env.RESEND_API_KEY,
};

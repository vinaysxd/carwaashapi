function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

const logger = {
  info:  (msg) => console.log(`[${timestamp()}] INFO: ${msg}`),
  error: (msg) => console.error(`[${timestamp()}] ERROR: ${msg}`),
  warn:  (msg) => console.warn(`[${timestamp()}] WARN: ${msg}`),
  debug: (msg) => console.log(`[${timestamp()}] DEBUG: ${msg}`),
};

module.exports = logger;

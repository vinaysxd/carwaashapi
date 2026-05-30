if (!process.env.DATABASE_URL) {
  require('dotenv').config();
}
const knex = require('knex');

const url = new URL(process.env.DATABASE_URL);

const db = knex({
  client: 'pg',
  connection: {
    host: url.hostname,
    port: Number(url.port),
    user: url.username,
    password: String(url.password),
    database: url.pathname.slice(1),
  },
  pool: { min: 2, max: 10 },
  acquireConnectionTimeout: 60000,
});

db.raw('select 1+1 as result')
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection failed:', err));

module.exports = db;

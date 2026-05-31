require('dotenv').config();
const db = require('../src/config/database.js');

async function main() {
  await db.raw('GRANT ALL ON public.payments TO service_role');
  await db.raw('ALTER TABLE payments DISABLE ROW LEVEL SECURITY');
  console.log('Permissions granted for payments table');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

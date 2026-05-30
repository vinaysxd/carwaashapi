require('dotenv').config();
const db = require('../src/config/database.js');

const migrations = [
  '001_create_users.js',
  '002_create_otp_verification.js',
  '003_create_refresh_tokens.js',
  '004_create_customer_profiles.js',
  '005_create_buildings.js',
  '006_create_staff_profiles.js',
  '007_create_vehicles.js',
  '008_create_subscription_plans.js',
  '009_create_coupons.js',
  '010_create_subscriptions.js',
  '011_create_presence_logs.js',
  '012_create_bookings.js',
  '013_create_jobs.js',
  '014_create_services.js',
  '015_create_public_holidays.js',
  '016_create_blocked_dates.js',
];

async function main() {
  await db.migrate.currentVersion();

  const rows = migrations.map((name) => ({
    name,
    batch: 1,
    migration_time: new Date(),
  }));

  await db('knex_migrations').insert(rows);

  console.log('All migrations marked as completed');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

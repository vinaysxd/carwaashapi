exports.up = function (knex) {
  return knex.schema.alterTable('bookings', (table) => {
    table.uuid('service_id').nullable().references('id').inTable('services').onDelete('SET NULL');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('bookings', (table) => {
    table.dropColumn('service_id');
  });
};

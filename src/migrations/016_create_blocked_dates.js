exports.up = function (knex) {
  return knex.schema.createTable('blocked_dates', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('building_id').nullable().references('id').inTable('buildings').onDelete('CASCADE');
    table.date('date').notNullable();
    table.text('reason').nullable();
    table.uuid('blocked_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.boolean('is_system_blocked').defaultTo(false);
    table.boolean('notify_customers').defaultTo(true);
    table.text('cancellation_reason').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('blocked_dates');
};

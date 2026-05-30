exports.up = function (knex) {
  return knex.schema.createTable('presence_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('vehicle_id').nullable().references('id').inTable('vehicles').onDelete('SET NULL');
    table.uuid('building_id').nullable().references('id').inTable('buildings').onDelete('SET NULL');
    table.uuid('subscription_id').nullable().references('id').inTable('subscriptions').onDelete('SET NULL');
    table.date('date').notNullable();
    table.timestamp('entry_time').notNullable();
    table.timestamp('exit_time').nullable();
    table.boolean('is_cleaned').defaultTo(false);
    table.decimal('latitude').nullable();
    table.decimal('longitude').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('presence_logs');
};

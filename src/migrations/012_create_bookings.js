exports.up = function (knex) {
  return knex.schema.createTable('bookings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('vehicle_id').nullable().references('id').inTable('vehicles').onDelete('SET NULL');
    table.uuid('building_id').nullable().references('id').inTable('buildings').onDelete('SET NULL');
    table.uuid('subscription_id').nullable().references('id').inTable('subscriptions').onDelete('SET NULL');
    table.text('service_type').notNullable();
    table.boolean('is_subscriber').defaultTo(false);
    table.decimal('price').notNullable();
    table.text('status').notNullable().defaultTo('pending');
    table.date('scheduled_date').notNullable();
    table.time('scheduled_time').notNullable();
    table.boolean('key_dropped').defaultTo(false);
    table.timestamp('key_drop_time').nullable();
    table.text('parking_level').nullable();
    table.text('parking_zone').nullable();
    table.text('parking_slot').nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('bookings');
};

exports.up = function (knex) {
  return knex.schema.createTable('services', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable();
    table.text('service_type').notNullable();
    table.text('vehicle_category').notNullable();
    table.decimal('regular_price').notNullable();
    table.decimal('subscriber_price').notNullable();
    table.integer('duration_minutes').notNullable().defaultTo(60);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('services');
};

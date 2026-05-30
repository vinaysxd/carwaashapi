exports.up = function (knex) {
  return knex.schema.createTable('vehicles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('make').notNullable();
    table.text('model').notNullable();
    table.text('colour').notNullable();
    table.text('plate_number').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('vehicles');
};

exports.up = function (knex) {
  return knex.schema.createTable('public_holidays', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable();
    table.date('date').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('public_holidays');
};

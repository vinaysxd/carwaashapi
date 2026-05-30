exports.up = function (knex) {
  return knex.schema.createTable('buildings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable();
    table.text('address').notNullable();
    table.text('city').notNullable();
    table.integer('total_levels').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.uuid('admin_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('buildings');
};

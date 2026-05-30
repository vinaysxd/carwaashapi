exports.up = function (knex) {
  return knex.schema.createTable('subscription_plans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('name').notNullable();
    table.decimal('price').notNullable();
    table.integer('days_per_week').notNullable();
    table.text('description').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('subscription_plans');
};

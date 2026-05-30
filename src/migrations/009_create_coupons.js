exports.up = function (knex) {
  return knex.schema.createTable('coupons', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('code').notNullable().unique();
    table.uuid('building_id').nullable().references('id').inTable('buildings').onDelete('SET NULL');
    table.text('discount_type').notNullable();
    table.decimal('discount_value').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.date('expiry_date').nullable();
    table.integer('max_uses').nullable();
    table.integer('current_uses').defaultTo(0);
    table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('coupons');
};

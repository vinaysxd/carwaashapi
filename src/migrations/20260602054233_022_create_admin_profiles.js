/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.hasTable('admin_profiles').then((exists) => {
    if (exists) return;
    return knex.schema.createTable('admin_profiles', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      table.uuid('building_id').notNullable().references('id').inTable('buildings').onDelete('CASCADE');
      table.text('name').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('admin_profiles');
};

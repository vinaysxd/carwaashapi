exports.up = function (knex) {
  return knex.schema.createTable('staff_profiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('name').notNullable();
    table.text('employee_id').notNullable().unique();
    table.uuid('building_id').nullable().references('id').inTable('buildings').onDelete('SET NULL');
    table.boolean('is_approved').defaultTo(false);
    table.uuid('approved_by').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('approved_at').nullable();
    table.text('profile_photo_url').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('staff_profiles');
};

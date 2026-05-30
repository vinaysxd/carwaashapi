exports.up = function (knex) {
  return knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('token').notNullable().unique();
    table.text('device_info').nullable();
    table.boolean('is_revoked').defaultTo(false);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('refresh_tokens');
};

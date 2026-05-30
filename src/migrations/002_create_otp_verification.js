exports.up = function (knex) {
  return knex.schema.createTable('otp_verification', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.text('phone_number').notNullable();
    table.text('otp').notNullable();
    table.boolean('is_used').defaultTo(false);
    table.timestamp('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('otp_verification');
};

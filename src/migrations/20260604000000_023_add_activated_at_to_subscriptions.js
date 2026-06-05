exports.up = function (knex) {
  return knex.schema.alterTable('subscriptions', (table) => {
    table.timestamp('activated_at').nullable();
    table.text('qr_code').nullable().alter();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('subscriptions', (table) => {
    table.dropColumn('activated_at');
    table.text('qr_code').notNullable().alter();
  });
};

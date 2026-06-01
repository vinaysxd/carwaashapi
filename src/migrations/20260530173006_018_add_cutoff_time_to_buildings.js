exports.up = function (knex) {
  return knex.schema.alterTable('buildings', (table) => {
    table.time('cutoff_time').defaultTo('14:00:00');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('buildings', (table) => {
    table.dropColumn('cutoff_time');
  });
};

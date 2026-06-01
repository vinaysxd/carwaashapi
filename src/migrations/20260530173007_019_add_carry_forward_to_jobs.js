exports.up = function (knex) {
  return knex.schema.alterTable('jobs', (table) => {
    table.boolean('carry_forward').defaultTo(false);
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('jobs', (table) => {
    table.dropColumn('carry_forward');
  });
};

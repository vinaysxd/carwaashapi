exports.up = function (knex) {
  return knex.schema.createTable('jobs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('staff_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.uuid('subscription_id').nullable().references('id').inTable('subscriptions').onDelete('SET NULL');
    table.uuid('booking_id').nullable().references('id').inTable('bookings').onDelete('SET NULL');
    table.uuid('vehicle_id').nullable().references('id').inTable('vehicles').onDelete('SET NULL');
    table.uuid('building_id').nullable().references('id').inTable('buildings').onDelete('SET NULL');
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
    table.text('job_type').notNullable();
    table.text('status').notNullable().defaultTo('assigned');
    table.date('scheduled_date').notNullable();
    table.text('before_photo_url').nullable();
    table.text('after_photo_url').nullable();
    table.timestamp('started_at').nullable();
    table.timestamp('completed_at').nullable();
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('jobs');
};

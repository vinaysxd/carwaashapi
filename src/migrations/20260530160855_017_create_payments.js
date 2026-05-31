exports.up = function (knex) {
  return knex.schema.createTable('payments', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').nullable();
    table.uuid('subscription_id').references('id').inTable('subscriptions').nullable();
    table.uuid('booking_id').references('id').inTable('bookings').nullable();
    table.text('razorpay_order_id').nullable();
    table.text('razorpay_payment_id').nullable();
    table.text('razorpay_subscription_id').nullable();
    table.text('razorpay_signature').nullable();
    table.decimal('amount').notNullable();
    table.text('currency').notNullable().defaultTo('INR');
    table.text('payment_type').notNullable();
    table.text('status').notNullable().defaultTo('pending');
    table.text('notes').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('payments');
};

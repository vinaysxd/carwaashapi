exports.up = function (knex) {
  return knex.schema.createTable('subscriptions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').nullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('vehicle_id').nullable().references('id').inTable('vehicles').onDelete('SET NULL');
    table.uuid('building_id').nullable().references('id').inTable('buildings').onDelete('SET NULL');
    table.uuid('plan_id').nullable().references('id').inTable('subscription_plans').onDelete('SET NULL');
    table.specificType('selected_days', 'text[]').defaultTo('{}');
    table.text('qr_code').notNullable().unique();
    table.text('status').notNullable().defaultTo('active');
    table.decimal('discount_percentage').defaultTo(0);
    table.uuid('coupon_id').nullable();
    table.text('razorpay_subscription_id').nullable();
    table.date('start_date').notNullable();
    table.date('end_date').nullable();
    table.decimal('price_after_discount').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('subscriptions');
};

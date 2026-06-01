const supabase = require('../supabase');

const SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const SLOT_CAPACITY = 2;

async function getServices() {
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true);
  if (error) throw new Error(error.message);
  return { success: true, services };
}

async function getAvailability(date, building_id) {
  const localDate = new Date(date + 'T00:00:00');
  if (isNaN(localDate.getTime())) {
    throw Object.assign(new Error('Invalid date format'), { status: 400 });
  }

  const unavailableResponse = (reason) => ({
    success: true,
    date,
    available: false,
    reason,
    slots: SLOTS.map(time => ({ time, available: false, remaining: 0 })),
  });

  if (localDate.getDay() === 0) {
    return unavailableResponse('Service not available on Sundays');
  }

  const { data: holiday, error: holidayErr } = await supabase
    .from('public_holidays')
    .select('id')
    .eq('date', date)
    .limit(1)
    .maybeSingle();
  if (holidayErr) throw new Error(holidayErr.message);
  if (holiday) return unavailableResponse('Service not available on public holidays');

  const { data: blocked, error: blockedErr } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('date', date)
    .eq('building_id', building_id)
    .limit(1)
    .maybeSingle();
  if (blockedErr) throw new Error(blockedErr.message);
  if (blocked) return unavailableResponse('Service not available for this building on this date');

  const { data: bookings, error: bookingsErr } = await supabase
    .from('bookings')
    .select('scheduled_time')
    .eq('scheduled_date', date)
    .eq('building_id', building_id)
    .neq('status', 'cancelled');
  if (bookingsErr) throw new Error(bookingsErr.message);

  const slotCounts = {};
  SLOTS.forEach(s => { slotCounts[s] = 0; });
  (bookings || []).forEach(b => {
    if (slotCounts[b.scheduled_time] !== undefined) slotCounts[b.scheduled_time]++;
  });

  const today = new Date().toISOString().split('T')[0];
  const isSameDay = date === today;
  const cutoffMs = Date.now() + 60 * 60 * 1000;

  const slots = SLOTS.map(time => {
    const count = slotCounts[time];
    const remaining = Math.max(0, SLOT_CAPACITY - count);
    let available = remaining > 0;

    if (available && isSameDay) {
      const slotMs = new Date(date + 'T' + time + ':00').getTime();
      if (slotMs <= cutoffMs) available = false;
    }

    return { time, available, remaining: available ? remaining : 0 };
  });

  return { success: true, date, slots };
}

async function createBooking(user_id, { service_id, vehicle_id, building_id, scheduled_date, scheduled_time, notes }) {
  const today = new Date().toISOString().split('T')[0];
  if (scheduled_date < today) {
    throw Object.assign(new Error('Cannot book a date in the past'), { status: 400 });
  }

  if (!SLOTS.includes(scheduled_time)) {
    throw Object.assign(new Error('Invalid time slot. Must be hourly between 09:00 and 17:00'), { status: 400 });
  }

  const { count, error: countErr } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('scheduled_date', scheduled_date)
    .eq('scheduled_time', scheduled_time)
    .eq('building_id', building_id)
    .neq('status', 'cancelled');
  if (countErr) throw new Error(countErr.message);
  if (count >= SLOT_CAPACITY) {
    throw Object.assign(new Error('This time slot is fully booked'), { status: 409 });
  }

  const { data: service, error: serviceErr } = await supabase
    .from('services')
    .select('id, name, service_type, regular_price, subscriber_price, is_active')
    .eq('id', service_id)
    .single();
  if (serviceErr) {
    if (serviceErr.code === 'PGRST116') throw Object.assign(new Error('Service not found'), { status: 404 });
    throw new Error(serviceErr.message);
  }
  if (!service.is_active) throw Object.assign(new Error('Service is not active'), { status: 400 });

  const { data: subscription, error: subErr } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user_id)
    .eq('building_id', building_id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  if (subErr) throw new Error(subErr.message);

  const isSubscriber = !!subscription;
  const price = isSubscriber ? service.subscriber_price : service.regular_price;

  const { data: booking, error: insertErr } = await supabase
    .from('bookings')
    .insert({
      user_id,
      service_id,
      service_type: service.service_type,
      vehicle_id,
      building_id,
      subscription_id: subscription ? subscription.id : null,
      is_subscriber: isSubscriber,
      scheduled_date,
      scheduled_time,
      notes: notes || null,
      price,
      status: 'pending',
    })
    .select('id, scheduled_date, scheduled_time, price, status')
    .single();
  if (insertErr) throw new Error(insertErr.message);

  return {
    success: true,
    booking: {
      id: booking.id,
      service: { id: service.id, name: service.name },
      scheduled_date: booking.scheduled_date,
      scheduled_time: booking.scheduled_time,
      price: booking.price,
      status: booking.status,
    },
  };
}

async function getMyBookings(user_id, { limit, offset }) {
  const { data: bookings, count, error } = await supabase
    .from('bookings')
    .select('*, services(id, name)', { count: 'exact' })
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { bookings, total: count };
}

async function getBookingById(id, user_id) {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, services(id, name)')
    .eq('id', id)
    .eq('user_id', user_id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 });
  return { success: true, booking };
}

async function cancelBooking(id, user_id) {
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id, scheduled_date, status')
    .eq('id', id)
    .eq('user_id', user_id)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 });
  if (booking.status === 'cancelled') {
    throw Object.assign(new Error('Booking is already cancelled'), { status: 400 });
  }

  const scheduledDateTime = new Date(booking.scheduled_date + 'T00:00:00');
  const hoursUntil = (scheduledDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) {
    throw Object.assign(new Error('Cannot cancel within 24 hours of booking'), { status: 400 });
  }

  const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Booking cancelled successfully' };
}

async function confirmKeyDrop(id, user_id) {
  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('id')
    .eq('id', id)
    .eq('user_id', user_id)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!booking) throw Object.assign(new Error('Booking not found'), { status: 404 });

  const { error } = await supabase
    .from('bookings')
    .update({ key_dropped: true, key_drop_time: new Date().toISOString(), status: 'confirmed' })
    .eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, message: 'Key drop confirmed' };
}

module.exports = { getServices, getAvailability, createBooking, getMyBookings, getBookingById, cancelBooking, confirmKeyDrop };

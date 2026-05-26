const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const supabase = require('../supabase');
const sendOTP = require('../fast2sms');

const JWT_SECRET = process.env.JWT_SECRET;

function dbLog(table, params, response) {
  console.log('[DB]', table, '| params:', JSON.stringify(params), '| response:', JSON.stringify(response));
}

async function sendOtp(phone_number) {
  if (!/^\d{10}$/.test(phone_number)) {
    throw Object.assign(new Error('Phone number must be 10 digits'), { status: 400 });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const insertParams = { phone_number, otp, expires_at, is_used: false };  
  const insertRes = await supabase.from('otp_verification').insert(insertParams); 
  if (insertRes.error) {
    console.log(process.env.SUPABASE_PROJECT_URL)
    console.log(insertRes.error)
    throw new Error(insertRes.error.message);
  }

  await sendOTP(phone_number, otp);

  return { success: true, message: 'OTP sent successfully' };
}

async function verifyOtp(phone_number, otp) {
  const selectOtpParams = { phone_number, otp };
  console.log('[DB] otp_verification | select | params:', JSON.stringify(selectOtpParams));
  const { data: records, error } = await supabase
    .from('otp_verification')
    .select('*')
    .eq('phone_number', phone_number)
    .eq('otp', otp)
    .order('created_at', { ascending: false })
    .limit(1);
  dbLog('otp_verification | select', selectOtpParams, { data: records, error });

  if (error) throw new Error(error.message);
  if (!records || records.length === 0) {
    throw Object.assign(new Error('Invalid OTP'), { status: 400 });
  }

  const record = records[0];

  if (record.expires_at < new Date().toISOString()) {
    throw Object.assign(new Error('OTP has expired'), { status: 400 });
  }
  if (record.is_used) {
    throw Object.assign(new Error('OTP has already been used'), { status: 400 });
  }

  const markUsedParams = { id: record.id, is_used: true };
  console.log('[DB] otp_verification | update | params:', JSON.stringify(markUsedParams));
  const markUsedRes = await supabase.from('otp_verification').update({ is_used: true }).eq('id', record.id);
  dbLog('otp_verification | update', markUsedParams, { error: markUsedRes.error });

  const selectUserParams = { phone_number };
  console.log('[DB] users | select | params:', JSON.stringify(selectUserParams));
  let { data: users, error: userErr } = await supabase
    .from('users')
    .select('*')
    .eq('phone_number', phone_number)
    .limit(1);
  dbLog('users | select', selectUserParams, { data: users, error: userErr });
  if (userErr) throw new Error(userErr.message);

  let isNewUser = false;
  let user;
  if (!users || users.length === 0) {
    isNewUser = true;
    const createParams = { phone_number, role: 'customer' };
    console.log('[DB] users | insert | params:', JSON.stringify(createParams));
    const { data: created, error: createErr } = await supabase
      .from('users')
      .insert(createParams)
      .select()
      .single();
    dbLog('users | insert', createParams, { data: created, error: createErr });
    if (createErr) throw new Error(createErr.message);
    user = created;
  } else {
    user = users[0];
  }

  const updateLoginParams = { id: user.id, last_login_at: new Date().toISOString() };
  console.log('[DB] users | update | params:', JSON.stringify(updateLoginParams));
  const updateLoginRes = await supabase
    .from('users')
    .update({ last_login_at: updateLoginParams.last_login_at })
    .eq('id', user.id);
  dbLog('users | update', updateLoginParams, { error: updateLoginRes.error });

  const accessToken = jwt.sign(
    { id: user.id, phone: user.phone_number, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const refreshToken = crypto.randomBytes(40).toString('hex');
  const refreshExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const rtParams = { user_id: user.id, token: refreshToken, expires_at: refreshExpiry, is_revoked: false };
  console.log('[DB] refresh_tokens | insert | params:', JSON.stringify(rtParams));
  const { error: rtErr } = await supabase.from('refresh_tokens').insert(rtParams);
  dbLog('refresh_tokens | insert', rtParams, { error: rtErr });
  if (rtErr) throw new Error(rtErr.message);

  return {
    success: true,
    accessToken,
    refreshToken,
    user: { id: user.id, phone_number: user.phone_number, role: user.role },
    isNewUser,
  };
}

async function refreshAccessToken(refreshToken) {
  const params = { token: refreshToken };
  console.log('[DB] refresh_tokens | select | params:', JSON.stringify(params));
  const { data: records, error } = await supabase
    .from('refresh_tokens')
    .select('*, users(*)')
    .eq('token', refreshToken)
    .limit(1);
  dbLog('refresh_tokens | select', params, { data: records, error });

  if (error) throw new Error(error.message);
  if (!records || records.length === 0) {
    throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  }

  const record = records[0];

  if (record.is_revoked) {
    throw Object.assign(new Error('Refresh token has been revoked'), { status: 401 });
  }
  if (record.expires_at < new Date().toISOString()) {
    throw Object.assign(new Error('Refresh token has expired'), { status: 401 });
  }

  const user = record.users;
  const accessToken = jwt.sign(
    { id: user.id, phone: user.phone_number, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { success: true, accessToken };
}

async function logout(refreshToken) {
  const params = { token: refreshToken, is_revoked: true };
  console.log('[DB] refresh_tokens | update | params:', JSON.stringify(params));
  const { error } = await supabase
    .from('refresh_tokens')
    .update({ is_revoked: true })
    .eq('token', refreshToken);
  dbLog('refresh_tokens | update', params, { error });
  if (error) throw new Error(error.message);
  return { success: true, message: 'Logged out successfully' };
}

module.exports = { sendOtp, verifyOtp, refreshAccessToken, logout };

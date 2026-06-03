require('dotenv').config();
const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;

async function sendOTP(phoneNumber, otp) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV MODE] OTP for ${phoneNumber}: ${otp}`);
    return { return: true, message: 'OTP logged to console (dev mode)' };
  }

  try {
    const response = await axios({
      method: 'GET',
      url: 'https://www.fast2sms.com/dev/bulkV2',
      params: {
        authorization: FAST2SMS_API_KEY,
        route: 'q',
        message: `Your SplashWash OTP is ${otp}`,
        language: 'english',
        flash: 0,
        numbers: phoneNumber,
      },
    });
    return response.data;
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
    throw err;
  }
}

module.exports = sendOTP;

if (require.main === module) {
  const testPhone = process.env.TEST_PHONE_NUMBER;
  const testOtp = Math.floor(100000 + Math.random() * 900000);
  sendOTP(testPhone, testOtp).catch(() => {});
}

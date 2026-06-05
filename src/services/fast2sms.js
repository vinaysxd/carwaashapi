require('dotenv').config();
const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_SENDER_ID = process.env.FAST2SMS_SENDER_ID;
const FAST2SMS_TEMPLATE_ID = process.env.FAST2SMS_TEMPLATE_ID;

async function sendOTP(phoneNumber, otp) {
  console.log(`=>Your OTP is ${otp}. Valid for 5 minutes. Do not share this code with anyone. - Carwaash`)
  try {
var params =  {
    authorization: FAST2SMS_API_KEY,
    sender_id: FAST2SMS_SENDER_ID,
    message: FAST2SMS_TEMPLATE_ID,
    variables_values: `${otp}|5|Carwaash`,
    route: 'dlt',
    numbers: phoneNumber,
  }
  console.log(params)
    const response = await axios({
  method: 'GET',
  url: 'https://www.fast2sms.com/dev/bulkV2',
  params: params
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

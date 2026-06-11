require('dotenv').config();
const axios = require('axios');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_SENDER_ID = process.env.FAST2SMS_SENDER_ID;
const FAST2SMS_TEMPLATE_ID = process.env.FAST2SMS_TEMPLATE_ID;
const FAST2SMS_MESSAGE_ID = process.env.FAST2SMS_MESSAGE_ID

async function sendOTP(phoneNumber, otp) {  
var url = `https://www.fast2sms.com/dev/bulkV2?authorization=${FAST2SMS_API_KEY}&sender_id=${FAST2SMS_SENDER_ID}&message=${FAST2SMS_MESSAGE_ID}&variables_values=${otp}%7C10%7CCarwaash&route=dlt&numbers=${phoneNumber}`
console.log("URL: ",url)
const options = {
  method: 'GET',
  url: url,
  headers: {accept: 'application/json'}
};

axios
  .request(options)
  .then(res => {
    return res.data;
  })
  .catch(err => {
    console.error("err",err)
  });
}

module.exports = sendOTP;

if (require.main === module) {
  const testPhone = process.env.TEST_PHONE_NUMBER;
  const testOtp = Math.floor(100000 + Math.random() * 900000);
  sendOTP(testPhone, testOtp).catch(() => {});
}

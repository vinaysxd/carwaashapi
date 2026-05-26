
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;

if (require.main === module) {
  if (razorpay) {
    console.log('Razorpay client initialized successfully');
  } else {
    console.error('Razorpay client initialization failed');
  }
}

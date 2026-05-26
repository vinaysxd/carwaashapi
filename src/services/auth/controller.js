const authService = require('./service');

async function sendOtp(req, res) {
  console.log('URL:---', process.env.SUPABASE_PROJECT_URL)
  try {
    const { phone_number } = req.body;
    const result = await authService.sendOtp(phone_number);
    res.json(result);
  } catch (err) {
    
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function verifyOtp(req, res) {
  try {
    const { phone_number, otp } = req.body;
    const result = await authService.verifyOtp(phone_number, otp);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
}

module.exports = { sendOtp, verifyOtp, refreshToken, logout };

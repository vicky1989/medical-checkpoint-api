const { generateOtp, storeOtp, validateOtp } = require('../utils/otpStore');

exports.sendOtp = (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ success: false, message: 'Phone required' });

  const otp = generateOtp();
  storeOtp(phone, otp);

  console.log(`📤 [SIMULATED] OTP for ${phone}: ${otp}`);
  res.json({ success: true, message: 'OTP sent (simulated)', otp });
};

exports.verifyOtp = (req, res) => {
  const { phone, otp } = req.body;
  const result = validateOtp(phone, otp);

  if (result === 'expired') return res.status(400).json({ success: false, message: 'OTP expired' });
  if (result === 'invalid') return res.status(400).json({ success: false, message: 'Invalid OTP' });

  res.json({ success: true, message: 'OTP verified' });
};

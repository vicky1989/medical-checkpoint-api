const store = {};

exports.generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.storeOtp = (phone, otp) => {
  store[phone] = { otp, createdAt: Date.now() };
};

exports.validateOtp = (phone, inputOtp) => {
  const record = store[phone];
  if (!record) return 'invalid';

  const { otp, createdAt } = record;
  const expired = Date.now() - createdAt > 5 * 60 * 1000;

  if (expired) {
    delete store[phone];
    return 'expired';
  }

  console.log('inputOtp: ',inputOtp)
  console.log('otp: ',otp)

  if (otp !== inputOtp) return 'invalid';

  delete store[phone]; // cleanup after success
  return 'valid';
};

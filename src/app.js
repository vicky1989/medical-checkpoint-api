const express = require('express');
const cors = require('cors');
const otpRoutes = require('./routes/otpRoutes');
const documentRoutes = require('./routes/documentRoutes');
const gptRoutes = require('./routes/gptRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/otp', otpRoutes); // all OTP APIs here
app.use('/api/document', documentRoutes);
app.use('/api/gpt', gptRoutes);
app.get('/', (req, res) => {
    res.send('🚑 Medical Checkpoint API is running!');
  });
module.exports = app;

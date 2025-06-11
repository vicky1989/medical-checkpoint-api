const express = require('express');
const router = express.Router();
const { askChatGPT } = require('../controllers/gptController');

router.post('/ask', askChatGPT);

module.exports = router;

const express = require('express');
const router = express.Router();
const myCabinetController = require('../controllers/myCabinet.controller');

router.post('/upload-avatar', myCabinetController.uploadAvatar);

router.post('/paymment', myCabinetController.payment);

module.exports = router;

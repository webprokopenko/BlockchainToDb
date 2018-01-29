const express = require('express');
const router = express.Router();

const ctrlETHWeb3 = require('../controllers/getETHWeb3');

router.get('/', ctrlETHWeb3.web3);

module.exports = router;
const express = require('express');
const app = module.exports = express();

// get list transaction by address
app.get('/getTransactionsList/:address', (req, res) => {
    const userId = req.params.address;
    res.status(404).send('OK!' + userId)
});
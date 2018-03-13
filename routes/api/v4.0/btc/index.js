const express = require('express');
const app = module.exports = express();
const btcController = require(`${appRoot}/controllers/btcController`);

// get list transaction by address
app.get('/getBalance/:address', (req, res, next) => {
    const address = req.params.address;

    btcController.getBalance(address)
        .then(transactions => {
            res.send(transactions);
            
        })
        .catch(error => {
            next(error)
        })
});
const express = require('express');
const app = module.exports = express();
const ltcController = require(`../../../../controllers/ltcController`);

// send raw transaction
app.get('/sendRawTransaction/:raw', (req, res, next) =>{
    const raw = req.params.raw;
    ltcController.sendRawTransaction(raw)
        .then(response => {
            res.send(response);
        })
        .catch(error => {
            next(error);
        })
});
// get balance by address
app.get('/getBalance/:address', (req, res, next) => {
    const address = req.params.address;
    ltcController.getBalance(address)
        .then(balance => {
            res.send(balance);

        })
        .catch(error => {
            next(error)
        })
});
// get listUTXOs by address
app.get('/getUTXOs/:address', (req, res, next) => {
    const address = req.params.address;
    ltcController.getUTXOs(address)
        .then(response => {
            res.send(response);

        })
        .catch(error => {
            next(error)
        })
});
//get txs list by address
app.get('/getTxList/:address', (req,res, next) => {
    const address = req.params.address;
    ltcController.getTxList(address)
        .then(txs => {
            res.send(txs);

        })
        .catch(error => {
            next(error)
        })
});

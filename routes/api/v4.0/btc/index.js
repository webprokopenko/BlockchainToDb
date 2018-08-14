const express = require('express');
const app = module.exports = express();
const btcController = require(`../../../../controllers/btcController`);

// send raw transaction
app.get('/sendRawTransaction/:raw', (req, res, next) =>{
    const raw = req.params.raw;
    btcController.sendRawTransaction(raw)
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
    btcController.getBalance(address)
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
    btcController.getUTXOs(address)
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
    btcController.getTxList(address)
        .then(txs => {
            res.send(txs);

        })
        .catch(error => {
            next(error)
        })
});

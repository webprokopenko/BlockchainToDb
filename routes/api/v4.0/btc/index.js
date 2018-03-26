const express = require('express');
const app = module.exports = express();
const btcController = require(`${appRoot}/controllers/btcController`);

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
// get listUnspent by address
app.get('/listUnspent/:address', (req, res, next) => {
    const address = req.params.address;

    btcController.listUnspent(address)
        .then(response => {
            res.send(response);
            
        })
        .catch(error => {
            next(error)
        })
});
//get txout by txid
app.get('/gettxout/:txid', (req,res, next) => {
    const txid = req.params.txid;
    btcController.gettxout(txid)
    .then(txout => {
        res.send(txout);
        
    })
    .catch(error => {
        next(error)
    })
});

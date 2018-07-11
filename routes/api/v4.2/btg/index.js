const express = require('express');
const app = module.exports = express();
const btgController = require(`${appRoot}/controllers/btgController`);

// send raw transaction
app.get('/sendRawTransaction/:raw', (req, res, next) =>{
    const raw = req.params.raw;
    btgController.sendRawTransaction(raw)
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
    btgController.getBalance(address)
        .then(balance => {
            res.send(balance);

        })
        .catch(error => {
            next(error)
        })
});
// get balanceNew by address
app.get('/getBalanceNew/:address', (req, res, next) => {
    const address = req.params.address;
    btgController.getBalanceNew(address)
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
    btgController.getUTXOsP(address, 0)
        .then(response => {
            res.setHeader('UtxoPages', response.pages);
            res.send(response);
        })
        .catch(error => {
            next(error)
        })
});
// get listUTXOs by address & pages
app.get('/getUTXOs/:address/:page', (req, res, next) => {
    const page = parseInt(req.params.page);
    const address = req.params.address;
    btgController.getUTXOsP(address, page)
        .then(response => {
            res.send({
                utxos: response.utxos
            });
        })
        .catch(error => {
            next(error)
        })
});
//get txs list by address
app.get('/getTransactionsList/:address', (req,res, next) => {
    const address = req.params.address;
    btgController.getAllTxList(address, 0)
        .then(transactions => {
            res.setHeader('TrPages', transactions.pages);
            res.send(transactions);
        })
        .catch(error => {
            next(error)
        })
});
//get txs list by address by page
app.get('/getTransactionsList/:address/:page', (req,res, next) => {
    const page = parseInt(req.params.page);
    const address = req.params.address;
    btgController.getAllTxList(address, page)
        .then(transactions => {
            res.send({
                pending:        transactions.pending,
                transactions:   transactions.transactions
            });
        })
        .catch(error => {
            next(error)
        })
});
// get raw transaction by id
app.get('/getTransactionById/:txid', (req, res, next) => {
    const txid = req.params.txid;
    btgController.getTransactionById(txid)
        .then(tx => {
            res.send(tx);
        })
        .catch(error => {
            next(error)
        })
});

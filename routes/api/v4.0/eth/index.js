const express = require('express');
const app = module.exports = express();
const ethController = require(`${appRoot}/controllers/ethController`);

// get list transaction by address
app.get('/getTransactionsList/:address', (req, res, next) => {
    const address = req.params.address;

    ethController.getTransactionlist(address)
        .then(transactions => {
            res.send(transactions);
        })
        .catch(error => {
            next(error)
        })
});
// get gasPrice
app.get('/getGasPrice', (req, res, next) => {
    ethController.getGasPrice()
        .then(gasPrice => {
            res.send(gasPrice);
        })
        .catch(() => {
            next(new Error('Internal Server Error'));
        })
});
//get gasLimit
app.get('/getGasLimit', (req, res, next) => {
    ethController.getGasLimit()
        .then(gasLimit => {
            res.send(gasLimit);
        })
        .catch(() => {
            next(new Error('Internal Server Error'));
        })
});
//get gasPrice and gasLimit
app.get('/getPriceLimit', (req, res, next) => {
    ethController.getPriceLimit()
        .then(gasPriceLimit => {
            res.send(gasPriceLimit);
        })
        .catch(() => {
            next(new Error('Internal Server Error'));
        })
});
//get balance from address
app.get('/getBalance/:address', (req, res, next) => {
    const address = req.params.address;
    ethController.getBalance(address)
        .then(balance => {
            res.send(balance)
        })
        .catch(error => {
            next(error);
        })
});
app.get('/getTransactionCount/:address', (req, res, next) => {
    const address = req.params.address;
    ethController.getTransactionCount(address)
        .then(transactionCount => {
            res.send(transactionCount)
        })
        .catch(error => {
            next(error);
        })
});
app.get('/sendRawTransaction/:rawTransaction', (req, res, next) => {
    const rawTransaction = req.params.rawTransaction;
    ethController.sendRawTransaction(rawTransaction)
        .then(transactonHash => {
            res.send(transactonHash)
        })
        .catch(() => {
            next(new Error('Internal Server Error'));
        })
})
app.get('/getTransactionByHash/:hashTransaction', (req, res, next) => {
    const hashTransaction = req.params.hashTransaction;
    ethController.getTransactionFromHash(hashTransaction)
        .then(txData => {
            res.send(txData)
        })
        .catch(() => {
            next(new Error('Internal Server Error'));
        })
})

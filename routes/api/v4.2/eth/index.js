const express = require('express');
const app = module.exports = express();
const ethController = require(`${appRoot}/controllers/ethController`);

app.get('/getTransactionsList/:address', (req, res, next) => {
    const address = req.params.address;
    ethController.getAllTransactionList(address)
        .then(transactions => {
            res.send(transactions);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/getGasPrice', (req, res, next) => {
    ethController.getGasPrice()
        .then(gasPrice => {
            res.send(gasPrice);
        })
        .catch(error => {
            next(error);
        })
});
app.get('/getGasLimit', (req, res, next) => {
    ethController.getGasLimit()
        .then(gasLimit => {
            res.send(gasLimit);
        })
        .catch(error => {
            next(error);
        })
});
app.get('/getPriceLimit', (req, res, next) => {
    ethController.getPriceLimit()
        .then(gasPriceLimit => {
            res.send(gasPriceLimit);
        })
        .catch(() => {
            next(error);
        })
});
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
        .catch(error => {
            next(error);
        })
});
app.get('/getTransactionByHash/:hashTransaction', (req, res, next) => {
    const hashTransaction = req.params.hashTransaction;
    ethController.getTransactionFromHash(hashTransaction)
        .then(txData => {
            res.send(txData)
        })
        .catch(error => {
            next(error);
        })
});
app.get('/getTokenBalance/:contractAddress/:address', (req, res, next) => {
    const contractAddress = req.params.contractAddress;
    const address = req.params.address;
    ethController.getTokenBalance(contractAddress, address)
        .then(tokens => {
            res.send(tokens)
        })
        .catch(error => {
            next(error);
        })
});
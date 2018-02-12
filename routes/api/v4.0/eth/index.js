const express = require('express');
const app = module.exports = express();
const ethController = require(`${appRoot}/controllers/ethController`);

// get list transaction by address
app.get('/getTransactionsList/:address', (req, res) => {
    const address = req.params.address;

    ethController.getTransactionlist(address)
        .then(transactions => {
            res.send(transactions);
        })
        .catch(error => {
            console.error(error);
        })
});
// get gasPrice
app.get('/getGasPrice', (req, res) => {
    ethController.getGasPrice()
        .then(gasPrice => {
            res.send(gasPrice);
        })
        .catch(error => {
            console.error(error);
        })
});
//get gasLimit
app.get('/getGasLimit', (req, res) => {
    ethController.getGasLimit()
        .then(gasLimit => {
            res.send(gasLimit);
        })
        .catch(error => {
            console.error(error);
        })
});
//get gasPrice and gasLimit
app.get('/getPriceLimit', (req, res) => {
    ethController.getPriceLimit()
        .then(gasPriceLimit => {
            res.send(gasPriceLimit);
        })
        .catch(error => {
            console.error(error);
        })
});
//get balance from address
app.get('/getBalance/:address', (req, res) => {
    const address = req.params.address;
    ethController.getBalance(address)
        .then(balance => {
            res.send(balance)
        })
        .catch(error => {
            console.error(error);
        })
});
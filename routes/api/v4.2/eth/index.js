const express = require('express');
const app = module.exports = express();
const ethController = require(`../../../../controllers/ethController4.2`);

app.get('/getTransactionsList/:address', (req, res, next) => {
    const address = req.params.address.toLowerCase();
    console.log(address);
    ethController.getTransactionListPending(address)
        .then(transactions => {
            res.setHeader('TrPages', transactions.pages);
            res.send(transactions);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/getTransactionsList/:address/:page', (req, res, next) => {
    const page = parseInt(req.params.page);
    const address = req.params.address.toLowerCase();
    ethController.getAllTransactionList(address, page)
        .then(transactions => {
            res.send(transactions.transactions);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/getTransactionsListByRand/:address/:from/:count', (req, res, next) => {
    const address = req.params.address.toLowerCase();
    const from = parseInt(req.params.from);
    const count = parseInt(req.params.count);
    ethController.getTransactionListByRange(address, from, count)
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
        .catch(error => {
            next(error);
        })
});
app.get('/getBalance/:address', (req, res, next) => {
    const address = req.params.address.toLowerCase();
    ethController.getBalance(address)
        .then(balance => {
            res.send(balance)
        })
        .catch(error => {
            next(error);
        })
});
app.get('/getBalanceETH/:address', (req, res, next) => {
    const address = req.params.address.toLowerCase();
    ethController.getBalanceETH(address)
        .then(balance => {
            res.send(balance)
        })
        .catch(error => {
            next(error);
        })
});
app.get('/getTransactionCount/:address', (req, res, next) => {
    const address = req.params.address.toLowerCase();
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
    const contractAddress = req.params.contractAddress.toLowerCase();
    const address = req.params.address.toLowerCase();
    ethController.getTokenBalance(contractAddress, address)
        .then(tokens => {
            res.send(tokens)
        })
        .catch(error => {
            next(error);
        })
});
app.post('/getTokenListBalance/', (req, res, next) => {
    const bodyRequest = req.body;
    ethController.getTokenListBalance(bodyRequest)
        .then(tokenList => {
            res.send(tokenList);
        })
        .catch(error => {
            next(error);
        })

});
app.get('/getContractTransfers/:contractAddress/:address', (req, res, next) => {
    const contractAddress = req.params.contractAddress.toLowerCase();
    const address = req.params.address.toLowerCase();
    ethController.getContractTransfersPage(contractAddress, address, 0)
        .then(transfers => {
            res.send(transfers)
        })
        .catch(error => {
            next(error);
        })
});
app.get('/getContractTransfers/:contractAddress/:address/:page', (req, res, next) => {
    const contractAddress = req.params.contractAddress.toLowerCase();
    const address = req.params.address.toLowerCase();
    const page = parseInt(req.params.page);
    ethController.getContractTransfersPage(contractAddress, address, page)
        .then(transfers => {
            res.send(transfers)
        })
        .catch(error => {
            next(error);
        })
});
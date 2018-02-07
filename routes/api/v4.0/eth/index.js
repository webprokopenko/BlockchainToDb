const express = require('express');
const app = module.exports = express();
const transactionController = require('../../../../controllers/ethController');

// get list transaction by address
app.get('/getTransactionsList/:address', (req, res) => {
    const address = req.params.address;
    
    transactionController.getTransactionlist(address)
    .then(transactions=>{
        res.send(transactions);
    })
    .catch(e=>{
        console.log('error' + e);
    })
    
});
const express = require('express');
const app = module.exports = express();
const ethController = require(`${appRoot}/controllers/ethController`);

// get list transaction by address
app.get('/getTransactionsList/:address', (req, res) => {
    const address = req.params.address;
    
    ethController.getTransactionlist(address)
    .then(transactions=>{
        res.send(transactions);
    })
    .catch(error=>{
        console.error(error);
    })
});
// get gasPrice
app.get('/getGasPrice', (req,res)=>{
     ethController.getGasPrice()
     .then(gasPrice=>{
         res.send(gasPrice);
     })
     .catch(error=>{
         console.error(error);
     })
});
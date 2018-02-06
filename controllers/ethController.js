require('../models/BlockTransactionModel.js');
const mongodbConnectionString = require('../config/config.json').mDbConnStrReadTransaction;
const mongoose = require('mongoose');
const BlockTransaction = mongoose.model('blockTransaction');
mongoose.connect(mongodbConnectionString);
console.log(mongodbConnectionString);

let z2 = '0x29b647028e05f15ede13f876d20b7b16e1a81c76';
async function getTransactionlist(address) {
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .find()
                .where({ 'transactions.from': address })
                .select({'transactions.from':-1,'transactions.to':-1,'transactions.fee':-1,'transactions.hash':-1,'transactions.value':-1,'timestamp':-1})
                .then(res => {
                    let out = [];
                    res.forEach(element => {
                        element.transactions.forEach(transaction=>{
                            if(transaction.from === address){
                                transaction.timestamp = element.timestamp;
                                out.push(transaction);
                            }
                        })
                    });
                    console.log(out);
                    res ? resolve(res) : reject(new Error(`function getLastBlockTransactionMongoDb no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
function prepareTransactionList(transactions) {
    return new Promise((resolve, reject) => {
        try {
            let oi = [];
            transactions.forEach(element => {
                let transaction = {};
                transaction.timestamp = element.timestamp;
                transaction.from = element.from;
                transaction.to = element.to;
                transaction.value = element.value;
                transaction.fee = element.fee;
                oi.push(transaction);
            });
            resolve(oi);
        } catch (error) {
            reject(error);
        }
    })
}
getTransactionlist(z2)
    .then(res => {
       
    })
    .catch(e => {
       
    })

module.exports = {
    getTransactionlist: getTransactionlist
}
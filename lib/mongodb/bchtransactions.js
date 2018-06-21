require('../../models/BitcoinCashTransactionModel');
require('../../models/BitcoinCashTempTransactionModel');
const BCHTransaction = mongoose.model('bchtransactions');
const BCHTempTransaction = mongoose.model('bchtmptxs');

async function getTransactionsList(address) {
    return new Promise((resolve, reject) => {
        try {
            BCHTransaction
                .find()
                .where({'vout.scriptPubKey.addresses': address })
                .sort({'blockheight': -1})
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getTransactionsList no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
function getPendingTransactions(address) {
    return new Promise((resolve, reject) => {
        try {
            BCHTempTransaction
                .find()
                .where({'vout.scriptPubKey.addresses': address })
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getPendingTransactions no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
async function saveTransactionToMongoDb(tx) {
    return new Promise((resolve, reject) => {
        try {
            const blockData = new BCHTransaction(tx);
            blockData.save()
                .then(() => {
                    return resolve(true);
                })
                .catch(e => {
                    return reject(e);
                });
        } catch (error) {
            return reject(error)
        }
    })
}
function saveTempTransactionToMongoDb(tx) {
    return new Promise((resolve, reject) => {
        try {
            const blockData = new BCHTempTransaction(tx);
            blockData.save()
                .then(() => {
                    return resolve(true);
                })
                .catch(e => {
                    return reject(e);
                });
        } catch (error) {
            return reject(error)
        }
    })
}
function removeTempTransaction(txid) {
    return new Promise((resolve, reject) => {
        try {
            BCHTempTransaction.remove({txid: txid})
                .then(() => {
                    return resolve(true);
                })
                .catch(err => {
                    return reject(err)
                });
        } catch (error) {
            return reject(error);
        }
    })
}
function getLastBlock() {
    return new Promise((resolve, reject) => {
        try {
            BCHTransaction.find()
                .sort({'blockheight': -1})
                .limit(1)
                .then(lastBlockN => {
                    return lastBlockN.length ?
                        resolve(lastBlockN[0].blockheight)
                        : reject('Empty collection bchtransactions');
                })
                .catch(error => {
                    return reject(error);
                })
        } catch (err) {
            return reject(err);
        }
    })
}
async function getCountTransaction(address){
    return new Promise((resolve, reject) => {
        try {
            BCHTransaction
                .count({'vout.scriptPubKey.addresses': address })
                .then(res => {
                    resolve(res)
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
async function getAllTransactionList(address, limit = 50 , skip = 0){
    return new Promise((resolve, reject) => {
        try {
            BCHTransaction
                .find()
                .where({'vout.scriptPubKey.addresses': address })
                .sort({'blockheight': -1})
                .limit(limit)
                .skip(skip)
                .select('-_id -blockNum -__v')
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getAllTransactionList no block number`));
                })
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    getTransactionslist:           getTransactionsList,
    saveTransactionToMongoDb:      saveTransactionToMongoDb,
    saveTempTransactionToMongoDb:  saveTempTransactionToMongoDb,
    getLastBlock:                  getLastBlock,
    getPendingTransactions:        getPendingTransactions,
    removeTempTransaction:         removeTempTransaction,
    getCountTransaction:           getCountTransaction,
    getAllTransactionList:         getAllTransactionList
};
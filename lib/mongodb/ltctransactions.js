require('../../models/LitecoinTransactionModel');
require('../../models/LitecoinTempTransactionModel');
const LTCTransaction = mongoose.model('ltctransactions');
const LTCTempTransaction = mongoose.model('ltctmptxs');

async function getTransactionsList(address) {
    return new Promise((resolve, reject) => {
        try {
            LTCTransaction
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
            LTCTempTransaction
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
            const blockData = new LTCTransaction(tx);
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
            const blockData = new LTCTempTransaction(tx);
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
            LTCTempTransaction.remove({txid: txid})
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
            LTCTransaction.find()
                .sort({'blockheight': -1})
                .limit(1)
                .then(lastBlockN => {
                    return lastBlockN.length ?
                        resolve(lastBlockN[0].blockheight)
                        : reject('Empty collection btctransactions');
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
            LTCTransaction
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
            LTCTransaction
                .find()
                .where({'vout.scriptPubKey.addresses': address })
                .sort({'blockheight': -1})
                .limit(limit)
                .skip(skip)
                .select('-_id -blockNum -__v')
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getAllTransactionList no block number`));
                })
                .catch(err => {
                    return reject(err);
                })
        } catch (error) {
            reject(error);
        }
    })
}

/**
 * Get tx with tx.fee field = calculated transaction fee
 * @param tx - transaction object
 * @returns {*}
 */
function calculateTransactionFee(tx) {
    try {
        tx.vinAmmount = 0;
        tx.vin.forEach(tvin => {
            if(tvin.value) {
                tx.vinAmmount += tvin.value;
            }
        });
        tx.voutAmmount = 0;
        tx.vout.forEach(tvout => {
            if(tvout.scriptPubKey && tvout.scriptPubKey.addresses) {
                tx.voutAmmount += tvout.value;
            }
        });
        tx.fee = (tx.vinAmmount && tx.voutAmmount) ? tx.vinAmmount - tx.voutAmmount : 0;
        return tx;
    } catch (error) {
        return tx;
    }
}
module.exports = {
    getTransactionslist:           getTransactionsList,
    saveTransactionToMongoDb:      saveTransactionToMongoDb,
    saveTempTransactionToMongoDb:  saveTempTransactionToMongoDb,
    removeTempTransaction:         removeTempTransaction,
    getLastBlock:                  getLastBlock,
    getAllTransactionList:         getAllTransactionList,
    getCountTransaction:           getCountTransaction,
    getPendingTransactions:        getPendingTransactions,
    calculateTransactionFee:       calculateTransactionFee
};
require('../../models/BitcoinTransactionModel');
require('../../models/BitcoinTempTransactionModel');
const BTCTransaction = mongoose.model('btctransactions');
const BTCTempTransaction = mongoose.model('btctmptxs');

async function getTransactionsList(address) {
    return new Promise((resolve, reject) => {
        try {
            BTCTransaction
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
            BTCTempTransaction
                .find()
                .where({$or: [
                        {'vin.addresses': address},
                        {'vout.scriptPubKey.addresses': address}
                    ]})
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
            const blockData = new BTCTransaction(tx);
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
            const blockData = new BTCTempTransaction(tx);
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
            BTCTempTransaction.remove({txid: txid})
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
            BTCTransaction.find()
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
            BTCTransaction
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
            BTCTransaction
                .find()
                .where({$or: [
                        {'vin.addresses': address},
                        {'vout.scriptPubKey.addresses': address}
                    ]})
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
async function getAllTransactionList_(address, limit = 50 , skip = 0){
        try {
            const txs = await BTCTransaction
                .aggregate()
                .lookup({
                        from: 'btctransactions',
                        localField: 'vin.txid',
                        foreignField: 'txid',
                        as: 'txvin'
                    })
                .project({
                    _id: 0,
                    blockhash: 1,
                    blockheight: 1,
                    txid: 1,
                    vin: {
                        txid: 1,
                        coinbase: 1
                    },
                    vout: 1,
                    tvin: {
                        $cond: {
                            if: {$isArray: '$txvin'},
                            then: {$concatArrays: ['$txvin']},
                            else: {$concatArrays: [{vout:{scriptPubKey:{addresses:['']}}}]}
                        }
                    }
                })
                .match(//{$or: [
                    //{'vout.scriptPubKey.addresses': address},
                        {'tvin.vout.scriptPubKey.addresses': address},
                    //]}
                )
                .limit(limit)
                .skip(skip)
                .exec();
            // txs.map(tx => {
            //     tx.ammount = 0;
            //     if(tx.txvin.length === 0) {
            //         tx.income = true;
            //         tx.vout.map(tvout => {
            //             if(tvout.scriptPubKey &&
            //                 tvout.scriptPubKey.addresses &&
            //                 tvout.scriptPubKey.addresses.indexOf(address) >= 0) {
            //                 tx.ammount += tvout.value;
            //             }
            //         });
            //     } else {
            //
            //     }
            // });
            return txs;
        } catch (error) {
            return new Error(`function getAllTransactionList return error: ${error.message}`);
        }
}
module.exports = {
    getTransactionslist:           getTransactionsList,
    saveTransactionToMongoDb:      saveTransactionToMongoDb,
    saveTempTransactionToMongoDb:  saveTempTransactionToMongoDb,
    removeTempTransaction:         removeTempTransaction,
    getLastBlock:                  getLastBlock,
    getAllTransactionList:         getAllTransactionList,
    getAllTransactionList_:         getAllTransactionList_,
    getCountTransaction:           getCountTransaction,
    getPendingTransactions:        getPendingTransactions
};
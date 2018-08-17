require('../../models/BitcoinGoldTransactionModel');
require('../../models/BitcoinGoldTempTransactionModel');
const BTGTransaction = mongoose.model('btgtransactions');
const BTGTempTransaction = mongoose.model('btgtmptxs');
function _getVoutTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BTGTransaction.aggregate()
                .lookup({
                    from: 'btgtransactions',
                    localField: 'txid',
                    foreignField: 'vin.txid',
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
                    txvin: 1
                })
                .match(
                    { 'vout.scriptPubKey.addresses': address }
                )
                .exec()
                .then(txs => {
                    return resolve(txs);
                })
                .catch(err => {
                    return reject(err);
                });
        } catch (err) {
            return reject(err);
        }
    })
}
function getTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BTGTransaction.find()
                .where(
                    {
                        $or: [
                            { 'vin.addresses': address },
                            { 'vout.scriptPubKey.addresses': address }
                        ]
                    }
                )
                .sort({ 'blockheight': -1 })
                .then(txs => {
                    return resolve(txs.map(tx => {
                        return {
                            blockheight: tx.blockheight,
                            blockhash: tx.blockhash,
                            timestamp: tx.timestamp,
                            txid: tx.txid,
                            version: tx.version,
                            locktime: tx.locktime,
                            size: tx.size,
                            vin: tx.vin.map(tvin => {
                                return {
                                    txid: tvin.txid,
                                    vout: tvin.vout,
                                    scriptSig: tvin.scriptSig,
                                    coinbase: tvin.coinbase,
                                    sequence: tvin.sequence
                                };
                            }),
                            vout: tx.vout.map(tvout => {
                                return {
                                    value: tvout.value,
                                    n: tvout.n,
                                    scriptPubKey: {
                                        asm: tvout.scriptPubKey.asm,
                                        hex: tvout.scriptPubKey.hex,
                                        reqSigs: tvout.scriptPubKey.reqSigs,
                                        tipe: tvout.scriptPubKey.tipe,
                                        addresses: tvout.scriptPubKey.addresses
                                            .map(ad => { return ad; })
                                    }
                                }
                            })
                        };
                    }));
                })
                .catch(err => {
                    return reject(new Error('getTxsByAddress error: ' + err));
                });
        } catch (err) {
            return reject(new Error('getTxsByAddress error: ' + err));
        }
    })
}
async function getTransactionsList(address) {
    return new Promise((resolve, reject) => {
        try {
            BTGTransaction
                .find()
                .where({$or: [
                        {'vin.addresses': address},
                        {'vout.scriptPubKey.addresses': address}
                    ]})
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
            BTGTempTransaction
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
            const blockData = new BTGTransaction(tx);
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
            const blockData = new BTGTempTransaction(tx);
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
            BTGTempTransaction.remove({txid: txid})
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
            BTGTransaction.find()
                .sort({'blockheight': -1})
                .limit(1)
                .then(lastBlockN => {
                    return lastBlockN.length ?
                        resolve(lastBlockN[0].blockheight)
                        : reject('Empty collection btgtransactions');
                })
                .catch(error => {
                    return reject(error);
                })
        } catch (err) {
            return reject(err);
        }
    })
}
function getFirstBlock() {
    return new Promise((resolve, reject) => {
        try {
            BTGTransaction.find()
                .sort({'blockheight': 1})
                .limit(1)
                .then(lastBlockN => {
                    return lastBlockN.length ?
                        resolve(lastBlockN[0].blockheight)
                        : reject('Empty collection btgtransactions');
                })
                .catch(error => {
                    return reject(error);
                })
        } catch (err) {
            return reject(err);
        }
    })
}
function getBlockByBlockNum(blockNum){
    return new Promise((resolve, reject) => {
        try {
            BTGTransaction.find()
                .where({'blockheight': blockNum})
                .limit(1)
                .then(lastBlockN => {
                    return lastBlockN.length ?
                        resolve(lastBlockN)
                        : reject(`getBlockByBlockNum() Empty blockNum ${blockNum}`);
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
            BTGTransaction
                .count({$or: [
                        {'vin.addresses': address},
                        {'vout.scriptPubKey.addresses': address}
                    ]})
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
            BTGTransaction
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
    getFirstBlock:                 getFirstBlock,
    getAllTransactionList:         getAllTransactionList,
    getCountTransaction:           getCountTransaction,
    getPendingTransactions:        getPendingTransactions,
    calculateTransactionFee:       calculateTransactionFee,
    getTxsByAddress:                getTxsByAddress,
    _getVoutTxsByAddress:           _getVoutTxsByAddress,
    getBlockByBlockNum:             getBlockByBlockNum
};
require(`../../models/EthereumTransactionModel.js`);
require(`../../models/EthereumTempTxsModel.js`);
const BlockTransaction = mongoose.model('ethtransactions');
const TempTransaction = mongoose.model('ethtemptxs');


async function getCountTransaction(address){
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .count({ $or:[ {'from':address}, {'to':address} ]})
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
            BlockTransaction
                .find({ $or:[ {'from':address}, {'to':address} ]})
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
async function getContractTransfers(contractAddress, address, limit = 50 , skip = 0){
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .find({ $or:[
                        {$and: [{'from':address}, {'to':contractAddress}]},
                        {$and: [{'input.to':address}, {'to':contractAddress}]}
                    ]})
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
async function getTransactionlistOut(address) {
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .find()
                .where({'from': address })
                .select('-_id -blockNum -__v')
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getTransactionlistOut no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
async function getPendingInTxs(address) {
    return new Promise((resolve, reject) => {
        try {
            TempTransaction
                .find()
                .where({'to': address })
                .select('-_id -blockNum -__v')
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getPendingInTxs no response`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
async function getPendingOutTxs(address) {
    return new Promise((resolve, reject) => {
        try {
            TempTransaction
                .find()
                .where({'from': address })
                .select('-_id -blockNum -__v')
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getPendingOutTxs no response`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
async function getTransactionlistIn(address) {
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .find()
                .where({'to': address })
                .select('-_id -blockNum -__v')
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getTransactionlistIn no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
async function saveBlockTransactionToMongoDb(data) {
    return new Promise((resolve, reject) => {
        try {
            const blockData = new BlockTransaction(data);
            blockData.save()
                .then(() => {
                    resolve(true);
                })
                .catch(e => {
                    reject(e);
                });
        } catch (error) {
            reject(error)
        }
    })
}
async function getLastMongoBlock() {
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .find()
                .select('blockNum')
                .sort({'blockNum': -1})
                .limit(1)
                .then(res => {
                    res && res.length ? resolve(res[0].blockNum) : reject(new Error(`function getLastMongoBlock no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
async function saveTempTransaction(data) {
    return new Promise((resolve, reject) => {
        try {
            const tempTx = new TempTransaction(data);
            tempTx.save()
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
async function removeTempTransaction(hash) {
    return new Promise((resolve, reject) => {
        try {
            TempTransaction.remove({hash: hash})
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
module.exports = {
    getTransactionlistIn:           getTransactionlistIn,
    getTransactionlistOut:          getTransactionlistOut,
    saveBlockTransactionToMongoDb:  saveBlockTransactionToMongoDb,
    getLastMongoBlock:              getLastMongoBlock,
    saveTempTransaction:            saveTempTransaction,
    removeTempTansaction:           removeTempTransaction,
    getPendingInTxs:                getPendingInTxs,
    getPendingOutTxs:               getPendingOutTxs,
    getAllTransactionList:          getAllTransactionList,
    getCountTransaction:            getCountTransaction,
    getContractTransfers:           getContractTransfers
};

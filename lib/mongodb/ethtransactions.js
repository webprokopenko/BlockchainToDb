require(`../../models/EthereumTransactionModel.js`);
const BlockTransaction = mongoose.model('ethtransactions');

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
async function saveBlockTransactionToMongoDb(blockData) {
    return new Promise((resolve, reject) => {
        try {
            blockData = new BlockTransaction(blockData);
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
                    res && res.length ? resolve(res[0]) : reject(new Error(`function getLastMongoBlock no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    getTransactionlistIn:           getTransactionlistIn,
    getTransactionlistOut:          getTransactionlistOut,
    saveBlockTransactionToMongoDb:  saveBlockTransactionToMongoDb,
    getLastMongoBlock:              getLastMongoBlock
};

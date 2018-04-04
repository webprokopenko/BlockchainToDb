require('../../models/BitcoinTransactionModel');
const BTCTransaction = mongoose.model('btctransactions');

async function getTransactionsList(address) {
    return new Promise((resolve, reject) => {
        try {
            BTCTransaction
                .find()
                .where({'to': address })
                .select('-_id -blockNum -__v')
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getTransactionsList no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
async function saveBTCTransactionsToMongoDb(blockData) {
    return new Promise((resolve, reject) => {
        try {
            blockData = new BTCTransaction(blockData);
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
module.exports = {
    getTransactionslist:           getTransactionslist,
    saveBTCTransactionsToMongoDb:  saveBTCTransactionsToMongoDb
};
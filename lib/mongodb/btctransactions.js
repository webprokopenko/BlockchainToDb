require('../../models/BitcoinTransactionModel');
const BTCTransaction = mongoose.model('btctransactions');

async function getTransactionsList(address) {
    return new Promise((resolve, reject) => {
        try {
            BTCTransaction
                .find()
                .where({'to': address })
                .select('-_id -__v')
                .then(res => {
                    res ? resolve(res) : reject(new Error(`function getTransactionsList no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
async function saveBTCTransactionsToMongoDb(tx) {
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
module.exports = {
    getTransactionslist:           getTransactionsList,
    saveBTCTransactionsToMongoDb:  saveBTCTransactionsToMongoDb
};
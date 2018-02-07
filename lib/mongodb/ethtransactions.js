require('../../models/EthereumTransactionModel.js');
const BlockTransaction = mongoose.model('ethtransactions');

let z2 = '0xbf5eaf0b9508c84a1d63553ae304848e3a0d3e71';
let z1 = '0xc76a10c537adca92ffa75fd455c0fc817297f5e5';
async function getTransactionlistOut(address) {
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .find()
                .where({'from': address })
                .then(res => {
                    res ? resolve({'out':res}) : reject(new Error(`function getLastBlockTransactionMongoDb no block number`));
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
                .then(res => {
                    res ? resolve({'in':res}) : reject(new Error(`function getLastBlockTransactionMongoDb no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    getTransactionlistIn:   getTransactionlistIn,
    getTransactionlistOut:  getTransactionlistOut
}

function EthereumDb(opts) {
    this.utils = opts.utils;
    this.utilsETH = opts.utilsETH;
    require(opts.appRoot + '/models/EthereumTransactionModel');
    this.transactions = mongoose.model('ethtransactions');
    require(opts.appRoot + '/models/EthereumTempTxsModel');
    this.tempTransactions = mongoose.model('ethtemptxs');
}

EthereumDb.prototype.removeTempTransaction = async function (hash) {
    await this.tempTransactions.remove({hash: hash});
    return true;
};
EthereumDb.prototype.saveTempTransaction = async function (data) {
    const tempTx = new this.tempTransactions(data);
    await tempTx.save();
    return true;
};
EthereumDb.prototype.getLastMongoBlock = async function () {
    const block = await this.transactions
        .find()
        .select('blockNum')
        .sort({'blockNum': -1})
        .limit(1)
        .exec();
    if (block.length === 0) throw new Error('function getLastMongoBlock no block number');
    return block[0].blockNum;
};
EthereumDb.prototype.saveBlockTransactionToMongoDb = async function (data) {
    const txs = new this.transactions(data);
    await txs.save();
    return true;
};
EthereumDb.prototype.getTempTransactions = async function (address) {
    return await this.tempTransactions
        .find({$or: [
                {'from': address},
                {'to': address}
            ]})
        .exec();
};
EthereumDb.prototype.getCountTransaction = async function (address) {
    return await this.transactions
        .count({$or: [
                {'from': address},
                {'to': address}
            ]});
};
EthereumDb.prototype.getAllTransactions = async function (address) {
    return await this.transactions
        .find({$or: [
                {'from': address},
                {'to': address}
            ]})
        .sort({timestamp: -1})
        .exec();
};
EthereumDb.prototype.getTransactions = async function (address, limit, skip) {
    return await this.transactions
        .find({$or: [
                {'from': address},
                {'to': address}
            ]})
        .limit(limit)
        .skip(skip)
        .sort({timestamp: -1})
        .exec();
};

module.exports = EthereumDb;
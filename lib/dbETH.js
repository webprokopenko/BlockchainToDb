function EthereumDb(opts) {
    Object.assign(this, opts);
    require(this.appRoot + '/models/' + this.name + 'TransactionModel');
    this.transactions = mongoose.model('ethtransactions');
    require(this.appRoot + '/models/' + this.name + 'TempTxsModel');
    this.tempTransactions = mongoose.model('ethtemptxs');
}

EthereumDb.prototype.getTempTransactions = async function (address) {
    return await this.tempTransactions
        .find({$or: [
                {'from': address},
                {'to': address}
            ]})
        .exec();
};
EthereumDb.prototype.getTransactionsCount = async function (address) {
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
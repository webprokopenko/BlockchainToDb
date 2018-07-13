function BitcoinDb(opts) {
    this.utils = opts.utils;
    this.utilsBTC = opts.utilsBTC;
    require(opts.appRoot + '/models/' + opts.name + 'TransactionModel');
    this.transactions = mongoose.model('btctransactions');
    require(opts.appRoot + '/models/' + opts.name + 'TempTransactionModel');
    this.tempTransactions = mongoose.model('btctmptxs');
}

BitcoinDb.prototype.getTempTransactions = async function (address) {
    return await this.tempTransactions
        .find({$or: [
                {'vin.addresses': address},
                {'vout.scriptPubKey.addresses': address}
            ]})
        .select('-_id -blockNum -__v')
        .exec();
};
BitcoinDb.prototype.getBalance = async function (address) {
    let tx = {};
    const txs = await this._getVoutTransactions(address);
    let income = 0;
    let outcome = 0;
    for(let txI = 0; txI < txs.length; txI++){
        tx = txs[txI];
        let first = this.utilsBTC.checkVout(tx.vout[0], address);
        let second = this.utilsBTC.checkVout(tx.vout[1], address);
        if(tx.txvin.length === 0) {
            income += first ? tx.vout[0].value : 0;
            income += second ? tx.vout[1].value : 0;
        } else {
            let unspent = true;
            for(let ivin = 0; ivin < tx.txvin.length; ivin++) {
                let tvin = tx.txvin[ivin];
                for(let tvii = 0; tvii < tvin.vin.length; tvii++) {
                    if (tx.txid === tvin.vin[tvii].txid) {
                        if(first && tvin.vin[tvii].vout === 0) {
                            unspent = false;
                            outcome += tx.vout[0].value;
                            income += tx.vout[0].value;
                        }
                        if(second && tvin.vin[tvii].vout === 1) {
                            unspent = false;
                            outcome += tx.vout[1].value;
                            income += tx.vout[1].value;
                        }
                        tvii = tvin.vin.length;
                    }
                }
            }
            if(unspent) {
                income += first ? tx.vout[0].value : 0;
                income += second ? tx.vout[1].value : 0;
            }
        }
    }
    return income - outcome;
};
BitcoinDb.prototype.getBalanceFast = async function (address) {
    let income = 0;
    let outcome = 0;
    const txs = await this.getAllTransactions(address);
    txs.forEach(tx => {
        if (tx.vin) tx.vin.forEach(tvin => {
            if (this.utilsBTC.checkVin(tvin, address)) outcome += tvin.value;
        });
        tx.vout.forEach(tvout => {
            if (this.utilsBTC.checkVout(tvout, address)) income += tvout.value;
        })
    });
    return income - outcome;
};
BitcoinDb.prototype.getCountTransaction = async function (address) {
    return await this.transactions
        .count({$or: [
                {'vin.addresses': address},
                {'vout.scriptPubKey.addresses': address}
            ]});
};
BitcoinDb.prototype.getAllTransactions = async function (address) {
    return await this.transactions
        .find({$or: [
                {'vin.addresses': address},
                {'vout.scriptPubKey.addresses': address}
            ]})
        .sort({timestamp: -1})
        .exec();
};
BitcoinDb.prototype.getTransactions = async function (address, limit, skip) {
    return await this.transactions
        .find({$or: [
                {'vin.addresses': address},
                {'vout.scriptPubKey.addresses': address}
            ]})
        .limit(limit)
        .skip(skip)
        .select('-_id -blockNum -__v')
        .sort({timestamp: -1})
        .exec();
};
BitcoinDb.prototype._getVoutTransactions = async function (address) {
    return await this.transactions.aggregate()
        .lookup({
            from: 'btctransactions',
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
            {'vout.scriptPubKey.addresses': address}
        )
        .exec()
};

module.exports = BitcoinDb;
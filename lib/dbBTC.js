function BitcoinDb(opts) {
    Object.assign(this, opts);
    require(this.appRoot + '/models/' + this.name + 'TransactionModel');
    this.transactions = mongoose.model('btctransactions');
    require(this.appRoot + '/models/' + this.name + 'TempTransactionModel');
    this.tempTransactions = mongoose.model('btctmptxs');
}
BitcoinDb.prototype.getBalance = async function(address) {
    let tx = {};
    const txs = await this._getVoutTransactions(address);
    let income = 0;
    let outcome = 0;
    for(let txI = 0; txI < txs.length; txI++){
        tx = txs[txI];
        let first = this._checkVout(tx.vout[0], address);
        let second = this._checkVout(tx.vout[1], address);
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
BitcoinDb.prototype._checkVout = function(vout, address) {
    return (vout &&
        vout.scriptPubKey &&
        vout.scriptPubKey.addresses &&
        vout.scriptPubKey.addresses.indexOf(address) >= 0)
};
BitcoinDb.prototype._getVoutTransactions = async function(address) {
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
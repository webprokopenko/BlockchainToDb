
const BitKindRpc = require('./BitKindRpc');
module.exports = class BitKind extends BitKindRpc{
    constructor(config, transactionModelString, bitKindMongooseTransactions) {
        super(config);
        require(transactionModelString);
        this.transactionModel = bitKindMongooseTransactions;
        this.sendRPC = require('./utils').sendRPC;
    }
    getTxsByAddress(address) {
        return new Promise((resolve, reject) => {
            try {
                this.transactionModel.find()
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
    async getBalance(address) {
        try {
            let tx = {};
            const txs = await this._getVoutTxsByAddress(address);
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
        } catch (error) {
            throw new Error('getBalance error: ' + error);
        }
    }
    async getUTXOs(address) {
        try {
            let tx = {};
            const txs = await this._getVoutTxsByAddress(address);
            const utxos = [];
            for (let txI = 0; txI < txs.length; txI++) {
                tx = txs[txI];
                let first = this._checkVout(tx.vout[0], address);
                let second = this._checkVout(tx.vout[1], address);
                if (tx.txvin.length === 0) {
                    if (first) this._pushUTXO(utxos, tx, 0, address);
                    if (second) this._pushUTXO(utxos, tx, 1, address);
                } else {
                    let unspent = true;
                    for (let ivin = 0; ivin < tx.txvin.length; ivin++) {
                        let tvin = tx.txvin[ivin];
                        for (let tvii = 0; tvii < tvin.vin.length; tvii++) {
                            if (tx.txid === tvin.vin[tvii].txid) {
                                if (first && tvin.vin[tvii].vout === 0) {
                                    unspent = false;
                                }
                                if (second && tvin.vin[tvii].vout === 1) {
                                    unspent = false;
                                }
                                tvii = tvin.vin.length;
                            }
                        }
                    }
                    if (unspent) {
                        if (first) this._pushUTXO(utxos, tx, 0, address);
                        if (second) this._pushUTXO(utxos, tx, 1, address);
                    }
                }
            }
            return utxos;
        } catch (error) {
            throw new Error('getUTXOs error: ' + error);
        }
    }
    async getUTXOsP(address, page = 0, limit = 50) {
        try {
            const utxos = await getUTXOs(address);
            const pages = Math.floor(utxos.length / limit);
            const start = (page * limit < utxos.length)
                ? page * limit
                : utxos.length - (limit < utxos.length ? limit : utxos.length);
            const finish = (start + limit < utxos.length)
                ? start + limit
                : utxos.length;
            return [pages + 1, utxos.slice(start, finish)];
        } catch (error) {
            throw new Error('getUTXOsP error: ' + error);
        }
    }
    _pushUTXO(arr, tx, n, address) {
        arr.push({
            txid: tx.txid,
            vout: n,
            address: address,
            scriptPubKey: tx.vout[n].scriptPubKey.hex,
            amount: tx.vout[n].value
        })
    }
    _checkVout(vout, address) {
        return (vout &&
            vout.scriptPubKey &&
            vout.scriptPubKey.addresses &&
            vout.scriptPubKey.addresses.indexOf(address) >= 0)
    }
    _checkVin(vin, address) {
        return (vin &&
            vin.addresses &&
            vin.addresses.indexOf(address) >= 0)
    }
    _getVoutTxsByAddress(address) {
        return new Promise((resolve, reject) => {
            try {
                this.transactionModel.aggregate()
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
}

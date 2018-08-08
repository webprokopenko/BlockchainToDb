
const BitKindRpc = require('./BitKindRpc');
const scannerError = require('../errors/ScannerError');
const handlerErr = require('../errors/HandlerErrors');
const Queue = require('./TaskQueue');

module.exports = class BitKind extends BitKindRpc {
    constructor(config, transactionLib, blockchain) {
        super(config, blockchain);
        this.sendRPC = require('./utils').sendRPC;
        this.transactionLib = transactionLib;
        this.blockchain = blockchain;
    }
    async getBalance(address) {
        try {
            let tx = {};
            const txs = await this.transactionLib._getVoutTxsByAddress(address);
            let income = 0;
            let outcome = 0;
            for (let txI = 0; txI < txs.length; txI++) {
                tx = txs[txI];
                let first = this._checkVout(tx.vout[0], address);
                let second = this._checkVout(tx.vout[1], address);
                if (tx.txvin.length === 0) {
                    income += first ? tx.vout[0].value : 0;
                    income += second ? tx.vout[1].value : 0;
                } else {
                    let unspent = true;
                    for (let ivin = 0; ivin < tx.txvin.length; ivin++) {
                        let tvin = tx.txvin[ivin];
                        for (let tvii = 0; tvii < tvin.vin.length; tvii++) {
                            if (tx.txid === tvin.vin[tvii].txid) {
                                if (first && tvin.vin[tvii].vout === 0) {
                                    unspent = false;
                                    outcome += tx.vout[0].value;
                                    income += tx.vout[0].value;
                                }
                                if (second && tvin.vin[tvii].vout === 1) {
                                    unspent = false;
                                    outcome += tx.vout[1].value;
                                    income += tx.vout[1].value;
                                }
                                tvii = tvin.vin.length;
                            }
                        }
                    }
                    if (unspent) {
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
            const txs = await this.transactionLib._getVoutTxsByAddress(address);
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
    async saveBlockTransactionFromTo(from, to, order, finishMethod, clearTemp = false) {
        const taskQue = new Queue(order);
        for (let i = from; i <= to; i++) {
            taskQue.pushTask(async done => {
                try {
                    let blockData = await this.getTransactionsFromBlock(i);
                    if (blockData) {
                        await Promise.all(blockData.map(async (element) => {
                            await this.transactionLib.saveTransactionToMongoDb(element);
                            if (clearTemp) await this.transactionLib
                                .removeTempTransaction(element.txid);
                        }));
                    }
                    console.log(`BlockNum: ${i}`);
                    done();
                } catch (error) {
                    if (parseInt(error.code) !== 11000) {
                        new handlerErr(new scannerError(`saveBlockTransactionToMongoDb Error Message: ${error}`, i, this.blockchain));
                    }
                    done();
                }
                if (i === to) {
                    finishMethod(i);
                }
            })
        }
    }
}

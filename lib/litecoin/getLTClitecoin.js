const ltcConfig = require(`${appRoot}/config/config.json`).LTCRpc;
const sendRPC = require(appRoot + '/lib/utils').sendRPC;
require(appRoot + '/models/LitecoinTransactionModel');
const LTCTransaction = mongoose.model('ltctransactions');
const rpcError = require(`${appRoot}/errors/RpcError`);

function getTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            LTCTransaction.find()
                .where(
                    {'vout.scriptPubKey.addresses': address}
                )
                .sort({'blockheight': -1})
                .then(txs => {
                    return resolve(txs.map(tx => {
                        return {
                            blockheight:    tx.blockheight,
                            blockhash:      tx.blockhash,
                            timestamp:      tx.timestamp,
                            txid:           tx.txid,
                            version:        tx.version,
                            locktime:       tx.locktime,
                            size:           tx.size,
                            vin:            tx.vin.map(tvin => {
                                return {
                                    txid:       tvin.txid,
                                    vout:       tvin.vout,
                                    scriptSig:  tvin.scriptSig,
                                    coinbase:   tvin.coinbase,
                                    sequence:   tvin.sequence
                                };
                            }),
                            vout:           tx.vout.map(tvout => {
                                return {
                                    value:          tvout.value,
                                    n:              tvout.n,
                                    scriptPubKey:   {
                                        asm:        tvout.scriptPubKey.asm,
                                        hex:        tvout.scriptPubKey.hex,
                                        reqSigs:    tvout.scriptPubKey.reqSigs,
                                        tipe:       tvout.scriptPubKey.tipe,
                                        addresses:  tvout.scriptPubKey.addresses
                                            .map(ad => { return ad;})
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
async function getUTXOs(address) {
    try {
        let tx = {};
        const txs = await _getVoutTxsByAddress(address);
        const utxos = [];
        for(let txI = 0; txI < txs.length; txI++){
            tx = txs[txI];
            let first = _checkVout(tx.vout[0], address);
            let second = _checkVout(tx.vout[1], address);
            if(tx.txvin.length === 0) {
                if (first) _pushUTXO(utxos, tx, 0, address);
                if (second) _pushUTXO(utxos, tx, 1, address);
            } else {
                let unspent = true;
                for(let ivin = 0; ivin < tx.txvin.length; ivin++) {
                    let tvin = tx.txvin[ivin];
                    for(let tvii = 0; tvii < tvin.vin.length; tvii++) {
                        if (tx.txid === tvin.vin[tvii].txid) {
                            if(first && tvin.vin[tvii].vout === 0) {
                                unspent = false;
                            }
                            if(second && tvin.vin[tvii].vout === 1) {
                                unspent = false;
                            }
                            tvii = tvin.vin.length;
                        }
                    }
                }
                if(unspent) {
                    if (first) _pushUTXO(utxos, tx, 0, address);
                    if (second) _pushUTXO(utxos, tx, 1, address);
                }
            }
        }
        return utxos;
    } catch (error) {
        throw new rpcError('getUTXOs error: ' + error, 'btc', 202);
    }
}
/**
 * @summary Get utxos by pages.
 * @address - string, bitcoin address, required
 * @page - integer, current page number, not required, default = 0
 * @limit - number utxo per page, not required, default = 50
 * @return result - Array,
 *              result[0] - integer, all pages count
 *              result[1] - array, current page utxos
 */
async function getUTXOsP(address, page = 0, limit = 50) {
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
        throw new rpcError('getUTXOs error: ' + error, 'btc', 202);
    }
}
function _pushUTXO(arr, tx, n, address) {
    arr.push({
        txid: tx.txid,
        vout: n,
        address: address,
        scriptPubKey: tx.vout[n].scriptPubKey.hex,
        amount: tx.vout[n].value
    })
}
function _checkVout(vout, address) {
    return (vout &&
        vout.scriptPubKey &&
        vout.scriptPubKey.addresses &&
        vout.scriptPubKey.addresses.indexOf(address) >= 0)
}
async function getBalance(address) {
    try {
        let tx = {};
        const txs = await _getVoutTxsByAddress(address);
        let income = 0;
        let outcome = 0;
        for(let txI = 0; txI < txs.length; txI++){
            tx = txs[txI];
            let first = _checkVout(tx.vout[0], address);
            let second = _checkVout(tx.vout[1], address);
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
        throw new rpcError('getBalance error: ' + error, 'ltc', 202);
    }
}
function sendRawTransaction(hex) {
    return new Promise((resolve, reject) =>{
        hex = String(hex) || '';
        sendRPC('sendrawtransaction', ltcConfig, [hex])
            .then(resp => {
                try {
                    const res = JSON.parse(resp);
                    if(res.error) {
                        return reject(new rpcError('sendrawtransaction error: ' + res.error.message, 'ltc', res.error.code));
                    }
                    if (!res.result)
                        return reject(new rpcError('sendrawtransaction response body empty', 'ltc', 200));
                    return resolve(res.result);
                } catch (error) {
                    return reject(new rpcError('sendrawtransaction error: ' + error, 'ltc', 203));
                }
            })
            .catch(err => {
                return reject(new rpcError('sendRawTransaction error: ' + err, 'ltc', 202));
            })
    });
}
function getTransactionsFromBlock(numBlock) {
    return new Promise((resolve, reject) => {
        try {
            getBlockHash(numBlock)
                .then(hash => {
                    return getBlockData(hash);
                })
                .then(blockData => {
                    const txs = [];
                    if (!blockData) {
                        return reject(new rpcError(`No data in block:${numBlock}`, 'ltc', 200));
                    } else {
                        blockData.tx.map(btx => {
                            const tx = {};
                            tx.blockheight = blockData.height;
                            tx.blockhash = blockData.hash;
                            tx.timestamp = blockData.time;
                            tx.txid = btx.txid;
                            tx.version = btx.version;
                            tx.locktime = btx.locktime;
                            tx.size = btx.size;
                            tx.vin = [];
                            tx.vout = [];
                            btx.vin.map(txvin => {
                                const tvin = {};
                                tvin.txid = txvin.txid;
                                tvin.vout = txvin.vout;
                                tvin.scriptSig = Object.assign({},txvin.scriptSig);
                                tvin.coinbase = txvin.coinbase;
                                tvin.sequence = txvin.sequence;
                                tx.vin.push(tvin);
                            });
                            btx.vout.map(txvout => {
                                const tvout = {};
                                tvout.value = txvout.value;
                                tvout.n = txvout.n;
                                tvout.scriptPubKey = {
                                    asm: txvout.scriptPubKey.asm,
                                    hex: txvout.scriptPubKey.hex,
                                    reqSigs: txvout.scriptPubKey.reqSigs,
                                    tipe: txvout.scriptPubKey.type,
                                    addresses: txvout.scriptPubKey.addresses
                                };
                                tx.vout.push(tvout);
                            });
                            txs.push(tx);
                        });
                        return resolve(txs);
                    }
                })
                .catch(error => {
                    return reject(error);
                })
        } catch (err) {
            return reject(new rpcError(`Error getTransactionsFromBlock:${err}`, 'ltc', 203));
        }
    })
}
function getBlockCount() {
    return new Promise((resolve, reject) =>{
        sendRPC('getblockcount', ltcConfig)
            .then(block => {
                let jblock = JSON.parse(block);
                if(jblock.error)
                    return reject( new rpcError(`getBlockCount return error ${jblock.error}`, 'ltc', jblock.error.code));
                if(!jblock.result)
                    return reject( new rpcError(`getBlockCount return no result`, 'ltc', 200));

                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new rpcError(`getBlockCount return: ${err}`, 'ltc', 202));
            })
    });
}
function getBlockData(hash) {
    return new Promise((resolve, reject) =>{
        sendRPC('getblock', ltcConfig, [hash, 2])
            .then(block => {
                let jblock = JSON.parse(block);
                if(jblock.error)
                    return reject( new rpcError(`getblock return error ${block.error}`, 'ltc', jblock.error.code));
                if(!jblock.result)
                    return reject( new rpcError(`getblock return empty result by hash ${hash}`, 'ltc', 200));
                return resolve(jblock.result);
            })
            .catch(err => {
                return reject(new rpcError('getBlockData return: ' + err, 'ltc', 202));
            })
    });
}
function getBlockHash(numBlock) {
    return new Promise((resolve, reject) =>{
        sendRPC('getblockhash', ltcConfig, [numBlock])
            .then(block => {
                let jblock = JSON.parse(block);
                if(jblock.error)
                    return reject( new rpcError(`getBlockCount return error ${jblock.error}`, 'ltc', jblock.error.code));
                if(!jblock.result)
                    return reject( new rpcError(`getBlockCount return no result`, 'ltc', 200));
                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new rpcError(`getBlockHash() return: ${err}`, 'ltc', 202));
            })
    });
}
function _getVoutTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            LTCTransaction.aggregate()
                .lookup({
                    from: 'ltctransactions',
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
function getRawTransaction(txid) {
    return new Promise((resolve, reject) => {
        sendRPC('getrawtransaction', ltcConfig, [txid, 1])
            .then(tx => {
                let rawtx = JSON.parse(tx);
                if(rawtx.error)
                    return reject( new rpcError(`getrawtransaction return error ${rawtx.error}`, 'ltc', rawtx.error.code));
                if(!rawtx.result)
                    return reject( new rpcError(`getrawtransaction return empty result by hash ${txid}`, 'ltc', 200));
                return resolve(rawtx.result);
            })
            .catch(err => {
                return reject(new rpcError('getrawtransaction return: ' + err, 'ltc', 202));
            })
    })
}
module.exports = {
    sendRawTransaction:         sendRawTransaction,
    getBlockCount:              getBlockCount,
    getBlockData:               getBlockData,
    getBlockHash:               getBlockHash,
    getTransactionsFromBlock:   getTransactionsFromBlock,
    getBalance:                 getBalance,
    getUTXOs:                   getUTXOs,
    getUTXOsP:                  getUTXOsP,
    getTxsByAddress:            getTxsByAddress,
    getRawTransaction:          getRawTransaction
};
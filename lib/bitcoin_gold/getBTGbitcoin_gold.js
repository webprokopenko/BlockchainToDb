const btgConfig = require(`../../config/config.json`).BTGRpc,
    sendRPC = require(appRoot + '/lib/utils').sendRPC;
require('../../models/BitcoinGoldTransactionModel');
const BTGTransaction = mongoose.model('btgtransactions');
const rpcError = require(`${appRoot}/errors/RpcError`);

function getTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BTGTransaction.find()
                .where(
                    {$or: [
                            {'vin.addresses': address},
                            {'vout.scriptPubKey.addresses': address}
                        ]}
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
        throw new rpcError('getUTXOs error: ' + error, 'btg', 202);
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
        throw new rpcError('getUTXOs error: ' + error, 'btg', 202);
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
        throw new rpcError('getBalance error: ' + error, 'btg', 202);
    }
}
function sendRawTransaction(hex) {
    return new Promise((resolve, reject) =>{
        hex = String(hex) || '';
        sendRPC('sendrawtransaction', btgConfig, [hex])
            .then(resp => {
                try {
                    const res = isJson(resp) ? JSON.parse(resp) : {};
                    if(res.error) {
                        return reject(new Error('Code-114 sendrawtransaction error: ' + res.error.message));
                    }
                    return resolve(res.result);
                } catch (error) {
                    return reject(new Error('sendrawtransaction error: ' + error));
                }
            })
            .catch(err => {
                return reject(new Error('sendrawtransaction error: ' + err));
            })
    });
}
async function getTransactionsFromBlock(numBlock) {
    try {
        const blockHash = await getBlockHash(numBlock);
        const blockData = await getBlockData(blockHash);
        const txs = [];
        if (!blockData.tx) {
            throw new rpcError(`No data in block:${numBlock}`, 'btg', 200);
        }
        while(blockData.tx.length > 0) {
            const btx = blockData.tx[0];
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
            while(btx.vin.length > 0) {
                const txvin = btx.vin[0];
                const tvin = {};
                const tv = (txvin.txid) ? await getRawTransaction(txvin.txid) : null;
                tvin.txid = txvin.txid;
                tvin.vout = txvin.vout;
                if (tv
                    && tv.vout[txvin.vout]
                    && tv.vout[txvin.vout].scriptPubKey
                    && tv.vout[txvin.vout].scriptPubKey.addresses
                ) {
                    tvin.addresses = tv.vout[txvin.vout].scriptPubKey.addresses;
                    tvin.value = tv.vout[txvin.vout].value;
                } else {
                    tvin.addresses = [];
                    tvin.value = 0;
                }
                tvin.scriptSig = Object.assign({}, txvin.scriptSig);
                tvin.coinbase = txvin.coinbase;
                tvin.sequence = txvin.sequence;
                tx.vin.push(tvin);
                btx.vin.shift();
            }
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
            blockData.tx.shift();
        }
        return txs;
    } catch (err) {
        throw new rpcError(`Error getTransactionsFromBlock: ${err}`, 'btg', 203);
    }
}
function getBlockCount() {
    return new Promise((resolve, reject) =>{
        sendRPC('getblockcount', btgConfig)
            .then(block => {
                let jblock = isJson(block) ? JSON.parse(block) : {};
                if(block === undefined)
                    return reject( new Error('getBlockCount() return undefined'));
                if(jblock.error)
                    return reject( new Error(`getBlockCount() return error ${jblock.error}`));
                if(!jblock.result)
                    return reject( new Error(`getBlockCount() return no result`));

                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new Error(`getBlockCount() return error ${err}`));
            })
    });
}
function getBlockData(hash) {
    return new Promise((resolve, reject) =>{
        sendRPC('getblock', btgConfig, [hash, 2])
            .then(block => {
                let jblock = isJson(block) ? JSON.parse(block) : {};
                if(block === undefined)
                    return reject( new Error('getBlockCount() return undefined'));
                if(jblock.error)
                    return reject( new Error(`getBlockCount() return error ${jblock.error}`));
                if(!jblock.result)
                    return reject( new Error(`getBlockCount() return no result by hash ${hash}`));

                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new Error(`getBlockCount() return error ${err}`));
            })
    });
}
function getBlockHash(numBlock) {
    return new Promise((resolve, reject) =>{
        sendRPC('getblockhash', btgConfig, [numBlock])
            .then(block => {
                let jblock = isJson(block) ? JSON.parse(block) : {};
                if(block === undefined)
                    return reject( new Error('getBlockCount() return undefined'));
                if(jblock.error)
                    return reject( new Error(`getBlockCount() return error ${jblock.error}`));
                if(!jblock.result)
                    return reject( new Error(`getBlockCount() return no result by blockNumber ${numBlock}`));


                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new Error(`getBlockCount() return error ${err}`));
            })
    });
}
function _getVoutTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BTGTransaction.aggregate()
                .lookup({
                    from: 'btgtransactions',
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
        sendRPC('getrawtransaction', btgConfig, [txid, 1])
            .then(tx => {
                let rawtx = isJson(tx) ? JSON.parse(tx) : {};
                if(rawtx.error)
                    return reject( new rpcError(`getrawtransaction return error ${rawtx.error}`, 'btg', rawtx.error.code));
                if(!rawtx.result)
                    return reject( new rpcError(`getrawtransaction return empty result by hash ${txid}`, 'btg', 200));
                return resolve(rawtx.result);
            })
            .catch(err => {
                return reject(new rpcError('getrawtransaction return: ' + err, 'btg', 202));
            })
    })
}
/**
 * Returns true if given string is valid json object
 *
 * @method isJson
 * @param {String} str
 * @return {Boolean}
 */
const isJson = function (str) {
    try {
        return !!JSON.parse(str);
    } catch (e) {
        return false;
    }
};
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

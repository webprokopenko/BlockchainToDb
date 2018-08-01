const bchConfig = require(`../../config/config.json`).BCHRpc;
const sendRPC = require(appRoot + '/lib/utils').sendRPC;
require('../../models/BitcoinCashTransactionModel');
const BCHTransaction = mongoose.model('bchtransactions');
const rpcError = require(`${appRoot}/errors/RpcError`);
const utils = require(appRoot + '/lib/bitcoin/utilsBTC');

function getTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BCHTransaction.find()
                .where(
                    {$or: [
                            {'vin.addresses': address},
                            {'vout.scriptPubKey.addresses': address}
                        ]}
                )
                .sort({'blockheight': -1})
                .select('-_id -blockNum -__v')
                .then(txs => {
                    return resolve(txs);
                })
                .catch(err => {
                    return reject(new rpcError('getTxsByAddress error: ' + err, 'bch', 202));
                });
        } catch (error) {
            return reject(new rpcError('getTxsByAddress error: ' + error, 'bch', 202));
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
        throw new rpcError('getUTXOs error: ' + error, 'bch', 202);
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
        throw new rpcError('getUTXOsP error: ' + error, 'btc', 202);
    }
}
function _pushUTXO(arr, tx, n, address) {
    arr.push({
        txid: tx.txid,
        vout: n,
        address: utils.fromCashAddr('bitcoincash:' + address, bchConfig.network),
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
function _checkVin(vin, address) {
    return (vin &&
        vin.addresses &&
        vin.addresses.indexOf(address) >= 0)
}
async function getBalanceNew(address) {
    let income = 0;
    let outcome = 0;
    const txs = await BCHTransaction.find()
        .where(
            {$or: [
                    {'vin.addresses': address},
                    {'vout.scriptPubKey.addresses': address}
                ]}
        )
        .sort({'blockheight': -1})
        .exec();
    txs.forEach(tx => {
        if (tx.vin) tx.vin.forEach(tvin => {
            if (_checkVin(tvin, address)) outcome += tvin.value;
        });
        tx.vout.forEach(tvout => {
            if (_checkVout(tvout, address)) income += tvout.value;
        })
    });
    return income - outcome;
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
        throw new rpcError('getBalance error: ' + error, 'bch', 202);
    }
}
function sendRawTransaction(hex) {
    return new Promise((resolve, reject) =>{
        hex = String(hex) || '';
        sendRPC('sendrawtransaction', bchConfig, [hex])
            .then(resp => {
                try {
                    const res = isJson(resp) ? JSON.parse(resp) : {};
                    if(res.error) {
                        return reject(new rpcError('sendrawtransaction error: ' + res.error.message, 'bch', res.error.code));
                    }
                    if (!res.result)
                        return reject(new rpcError('sendrawtransaction response body empty', 'bch', 200));
                    return resolve(res.result);
                } catch (error) {
                    return reject(new rpcError('sendRawTransaction error: ' + error, 'bch', 203));
                }
            })
            .catch(err => {
                return reject(new rpcError('sendrawtransaction return: ' + err, 'bch', 202));
            })
    });
}
async function getTransactionsFromBlock(numBlock) {
    try {
        const blockHash = await getBlockHash(numBlock);
        const blockData = await getBlockData(blockHash);
        const txs = [];
        if (!blockData.tx) {
            throw new rpcError(`No data in block:${numBlock}`, 'btc', 200);
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
        throw new rpcError(`Error getTransactionsFromBlock: ${err}`, 'btc', 203);
    }
}
function getBlockCount() {
    return new Promise((resolve, reject) =>{
        sendRPC('getblockcount', bchConfig)
            .then(block => {
                let jblock = isJson(block) ? JSON.parse(block) : {};
                if(jblock.error)
                    return reject( new rpcError(`getBlockCount return error ${jblock.error}`, 'btc', jblock.error.code));
                if(!jblock.result)
                    return reject( new rpcError(`getBlockCount return no result`, 'btc', 200));

                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new rpcError(`getBlockCount return error ${err}`, 'btc', 202));
            })
    });
}
function getBlockData(hash) {
    return new Promise((resolve, reject) => {
        try{
            let blockM = {};
            sendRPC('getblock', bchConfig, [hash, true])
                .then(blockData => {
                    const block = isJson(blockData) ? JSON.parse(blockData) : {};
                    if(block.error)
                        return reject( new rpcError(`getblock return error ${block.error}`, 'bch', block.error.code));
                    if(!block.result || !block.result.tx)
                        return reject( new rpcError(`getblock return no result by hash ${hash}`, 'bch', 200));
                    blockM = block.result;
                    return _getBlockTxsJson(blockM.tx);
                })
                .then(txs => {
                    if(!txs) {
                        return reject(new rpcError(`getblock
                    return empty result for block hash: ${hash}`, 'bch', 200));
                    } else {
                        blockM.tx = txs;
                        return resolve(blockM);
                    }
                })
                .catch(err => {
                    return reject( new rpcError(`getblock return error ${err}`, 'bch', 202));
                });
        } catch  (error) {
            return reject( new rpcError(`getblock return error ${error}`, 'bch', 203));
        }
    })
}
async function _getBlockTxsJson(txs) {
    try {
        const tx = [];
        for(let i = 0; i < txs.length; i++) {
            const id = txs[i];
            const data = await getRawTransaction(id);
            tx.push(data);
        }
        return tx;
    } catch (err) {
        return null;
    }
}
function getBlockHash(numBlock) {
    return new Promise((resolve, reject) =>{
        sendRPC('getblockhash', bchConfig, [numBlock])
            .then(block => {
                let jblock = JSON.parse(block);
                if(jblock.error)
                    return reject( new rpcError(`getblockhash() return error ${jblock.error}`, 'bch', jblock.error.code));
                if(!jblock.result)
                    return reject( new rpcError(`getblockhash() return no result by blockNumber ${numBlock}`, 'bch', 200));
                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new rpcError(`getblockhash() return error ${err}`, 'bch', 202));
            })
    });
}
function getRawTransaction(id) {
    return new Promise((resolve, reject) => {
        sendRPC('getrawtransaction', bchConfig, [id, true])
            .then(resp => {
                const tx = isJson(resp) ? JSON.parse(resp) : {};
                if(tx.error)
                    return reject( new rpcError(`getrawtransaction return error ${tx.error}`, 'bch', tx.error.code));
                if(!tx.result)
                    return reject( new rpcError(`getrawtransaction return no result by id: ${id}`, 'bch', 200));
                //console.dir(tx.result);
                return resolve({
                    txid: tx.result.txid,
                    version: tx.result.version,
                    locktime: tx.result.locktime,
                    size: tx.result.size,
                    vin: tx.result.vin ?
                        tx.result.vin.map(vi => {
                            return {
                                txid: vi.txid,
                                vout: vi.vout,
                                scriptSig: {
                                    asm: vi.scriptSig ? vi.scriptSig.asm : '',
                                    hex: vi.scriptSig ? vi.scriptSig.hex : ''
                                },
                                coinbase: vi.coinbase,
                                sequence: vi.sequence
                            };
                        }) :
                        [{txid: ''}],
                    vout: tx.result.vout ?
                        tx.result.vout.map(vo => {
                            return {
                                value: vo.value,
                                n: vo.n,
                                scriptPubKey: {
                                    hex: vo.scriptPubKey.hex,
                                    addresses: (vo.scriptPubKey
                                        && vo.scriptPubKey.addresses) ?
                                        vo.scriptPubKey.addresses.map(ad => {
                                        return ad.split(':')[1] || '';
                                    }) : []
                                }
                            }
                        }) :
                        [],
                });
            })
            .catch(err => {
                return reject( new rpcError(`getRawTransaction() return error ${err}`, 'bch', 202));
            })
    })
}
function _getVoutTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BCHTransaction.aggregate()
                .lookup({
                    from: 'bchtransactions',
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
    getRawTransaction:          getRawTransaction,
    getBalanceNew:              getBalanceNew
};

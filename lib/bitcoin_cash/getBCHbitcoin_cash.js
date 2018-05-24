const bchConfig = require(`../../config/config.json`).BCHRpc;
const sendRPC = require(appRoot + '/lib/utils').sendRPC;
require('../../models/BitcoinCashTransactionModel');
const BCHTransaction = mongoose.model('bchtransactions');
const rpcError = require(`${appRoot}/errors/RpcError`);

function getTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BCHTransaction.find()
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
            let k = 0;
            for(let i = 0; i < tx.vout.length; i++) {
                if (tx.vout[i].scriptPubKey.addresses &&
                    tx.vout[i].scriptPubKey.addresses.indexOf(address) >= 0) {
                    k = i;
                    i = tx.vout.length;
                }
            }
            tx.k = k;
            if(tx.txvin.length === 0) {
                utxos.push(tx);
            } else {
                let unspent = true;
                for(let ivin = 0; ivin < tx.txvin.length; ivin++) {
                    let tvin = tx.txvin[ivin];
                    for(let tvii = 0; tvii < tvin.vin.length; tvii++) {
                        if (tx.txid === tvin.vin[tvii].txid
                            && tvin.vin[tvii].vout === tx.vout[k].n) {
                            unspent = false;
                            tvii = tvin.vin.length;
                            ivin = tx.txvin.length;
                        }
                    }
                }
                if(unspent) utxos.push(tx);
            }
        }
        return utxos.map(utx => {
            return {
                txid: utx.txid,
                vout: utx.k,
                address: address,
                scriptPubKey: utx.vout[utx.k].scriptPubKey.hex,
                amount: utx.vout[utx.k].value
            }
        });
    } catch (error) {
        return new rpcError('getUTXOs error: ' + error, 'bch', 202);
    }
}
async function getBalance(address) {
    try {
        let tx = {};
        const txs = await _getVoutTxsByAddress(address);
        let income = 0;
        let outcome = 0;
        for(let txI = 0; txI < txs.length; txI++){
            tx = txs[txI];
            let k = 0;
            for(let i = 0; i < tx.vout.length; i++) {
                if (tx.vout[i].scriptPubKey.addresses &&
                    tx.vout[i].scriptPubKey.addresses.indexOf(address) >= 0) {
                    k = i;
                    i = tx.vout.length;
                }
            }
            if(tx.txvin.length === 0) {
                income += tx.vout[k].value;
            } else {
                let unspent = true;
                for(let ivin = 0; ivin < tx.txvin.length; ivin++) {
                    let tvin = tx.txvin[ivin];
                    for(let tvii = 0; tvii < tvin.vin.length; tvii++) {
                        if (tx.txid === tvin.vin[tvii].txid
                            && tvin.vin[tvii].vout === tx.vout[k].n) {
                            unspent = false;
                            outcome += tx.vout[k].value;
                            income += tx.vout[k].value;
                            tvii = tvin.vin.length;
                            ivin = tx.txvin.length;
                        }
                    }
                }
                if(unspent) income += tx.vout[k].value;
            }
        }
        return income - outcome;
    } catch (error) {
        return new rpcError('getBalance error: ' + error, 'bch', 202);
    }
}
function sendRawTransaction(hex) {
    return new Promise((resolve, reject) =>{
        hex = String(hex) || '';
        sendRPC('sendrawtransaction', bchConfig, [hex])
            .then(resp => {
                try {
                    const res = JSON.parse(resp);
                    if(res.error) {
                        return reject(new rpcError('sendrawtransaction error: ' + res.error.message, 'bch', res.error.code));
                    }
                    if (!res || !res.result)
                        return reject(new rpcError('sendrawtransaction response body empty', 'bch', 200));
                    return resolve(res.result);
                } catch (error) {
                    return reject(new rpcError('sendRawTransaction error: ' + error), 'bch', 203);
                }
            })
            .catch(err => {
                return reject(new rpcError('sendrawtransaction return: ' + err, 'bch', 202));
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
                        return reject(new rpcError(`No data in block:${numBlock}`, 'bch', 200));
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
            return reject(new rpcError(`Error getTransactionsFromBlock:${err}`, 'bch', 203));
        }
    })
}
function getBlockCount() {
    return new Promise((resolve, reject) =>{
        sendRPC('getblockcount', bchConfig)
            .then(block => {
                let jblock = JSON.parse(block);
                if(block === undefined)
                    return reject( new Error('RPC getBlockCount return undefined'));
                if(jblock.error)
                    return reject( new Error(`RPC getBlockCount return error ${jblock.error}`));
                if(!jblock.result)
                    return reject( new Error(`RPC getBlockCount return no result`));

                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new Error(`RPC getBlockCount return error ${err}`));
            })
    });
}
function getBlockData(hash) {
    return new Promise((resolve, reject) => {
        try{
            let blockM = {};
            sendRPC('getblock', bchConfig, [hash, true])
                .then(blockData => {
                    const block = JSON.parse(blockData);
                    if(block.error)
                        return reject( new rpcError(`RPC getblock return error ${block.error}`, 'bch', block.error.code));
                    if(!block.result || !block.result.tx)
                        return reject( new rpcError(`RPC getblock return no result by hash ${hash}`, 'bch', 200));
                    blockM = block.result;
                    return _getBlockTxsJson(blockM.tx);
                })
                .then(txs => {
                    if(!txs) {
                        return reject(new rpcError(`RPC getblock
                    return empty result for block hash: ${hash}`, 'bch', 200));
                    } else {
                        blockM.tx = txs;
                        return resolve(blockM);
                    }
                })
                .catch(err => {
                    return reject( new rpcError(`RPC getblock return error ${err}`, 'bch', 202));
                });
        } catch  (error) {
            return reject( new rpcError(`RPC getblock return error ${error}`, 'bch', 203));
        }
    })
}
async function _getBlockTxsJson(txs) {
    try {
        const tx = [];
        for(let i = 0; i < txs.length; i++) {
            const id = txs[i];
            const data = await getTransactionById(id);
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
function getTransactionById(id) {
    return new Promise((resolve, reject) => {
        sendRPC('getrawtransaction', bchConfig, [id, true])
            .then(resp => {
                const tx = JSON.parse(resp);
                if(tx.error)
                    return reject( new rpcError(`BCH getrawtransaction return error ${tx.error}`, 'bch', tx.error.code));
                if(!tx.result)
                    return reject( new rpcError(`BCH getrawtransaction return no result by id: ${id}`, 'bch', 200));
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
                return reject( new rpcError(`BCH getRawTransaction() return error ${err}`, 'bch', 202));
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
module.exports = {
    sendRawTransaction:         sendRawTransaction,
    getBlockCount:              getBlockCount,
    getBlockData:               getBlockData,
    getBlockHash:               getBlockHash,
    getTransactionsFromBlock:   getTransactionsFromBlock,
    getBalance:                 getBalance,
    getUTXOs:                   getUTXOs,
    getTxsByAddress:            getTxsByAddress
};

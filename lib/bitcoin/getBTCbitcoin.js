const btcConfig = require(`${appRoot}/config/config.json`).BTCRpc,
    sendRPC = require(appRoot + '/lib/utils').sendRPC;
    require(appRoot + '/models/BitcoinTransactionModel');
    const BTCTransaction = mongoose.model('btctransactions');

function getTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BTCTransaction.find()
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
        return new Error('getUTXOs error: ' + error);
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
            return new Error('getBalance error: ' + error);
    }
}
function sendRawTransaction(hex) {
    return new Promise((resolve, reject) =>{
        hex = String(hex) || '';
        sendRPC('sendrawtransaction', btcConfig, [hex])
            .then(resp => {
                try {
                    const res = JSON.parse(resp);
                    if(res.error) {
                        return reject(new Error('Code-114 sendrawtransaction error: ' + res.error.message));
                    }
                    return resolve(res.result);
                } catch (error) {
                    return reject(new Error('sendrawtransaction error: ' + error));
                }
            })
            .catch(err => {
                return reject(new Error('sendRawTransaction error: ' + err));
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
                        return reject(new Error(`No data in block:${numBlock}`));
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
                    return reject(new Error(error));
                })
        } catch (err) {
            return reject(new Error(`Error getTransactionsFromBlock:${err}`));
        }
    })
}
function getBlockCount() {
    return new Promise((resolve, reject) =>{
        sendRPC('getblockcount', btcConfig)
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
                return reject( new Error(`getBlockCount return: ${err}`));
            })
    });
}
function getBlockData(hash) {
    return new Promise((resolve, reject) =>{
        sendRPC('getblock', btcConfig, [hash, 2])
            .then(block => {
                let jblock = JSON.parse(block);
                if(block === undefined)
                    return reject( new Error('RPC getblock return undefined'));
                if(jblock.error)
                    return reject( new Error(`RPC getblock return error ${block.error}`));
                if(!jblock.result)
                    return reject( new Error(`RPC getblock return empty result by hash ${hash}`));
                return resolve(jblock.result);
            })
            .catch(err => {
                return reject(new Error('getBlockData return: ' + err));
            })
    });
}
function getBlockHash(numBlock) {
    return new Promise((resolve, reject) =>{
        sendRPC('getblockhash', btcConfig, [numBlock])
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
                return reject( new Error(`getBlockHash() return: ${err}`));
            })
    });
}
function _getVoutTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BTCTransaction.aggregate()
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

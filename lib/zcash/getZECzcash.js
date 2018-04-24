const zecConfig = require(`../../config/config.json`).ZECRpc,
    b64 = require('base-64'),
    XHR = require('xmlhttprequest').XMLHttpRequest;
require('../../models/ZcashTransactionModel');
const ZECTransaction = mongoose.model('zectransactions');

//Intel logger setup
const intel = require('intel');
const ZecError = intel.getLogger('ZecError');
ZecError.setLevel(ZecError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/zec/error.log`));

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
        const params = _rpcParams('sendrawtransaction', [hex]);
        _sendAPI(params)
            .then(resp => {
                try {
                    const res = JSON.parse(resp);
                    if(res.error) {
                        return reject(new Error('sendrawtransaction error: ' + res.error.message));
                    }
                    return resolve(res.result);
                } catch (error) {
                    return reject(new Error('sendrawtransaction error: ' + error));
                }
            })
            .catch(err => {
                return reject(new Error('sendrawtransaction return: ' + err));
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
            return reject(new Error(`Error getTransactionsFromBCH:${err}`));
        }
    })
}
function getBlockCount() {
    return new Promise((resolve, reject) =>{
        const params = _rpcParams('getblockcount');
        _sendAPI(params)
            .then(block => {
                let jblock = JSON.parse(block);
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
    return new Promise((resolve, reject) => {
        try{
            let blockM = {};
            const params = _rpcParams('getblock',[hash, true]);
            _sendAPI(params)
                .then(blockData => {
                    const block = JSON.parse(blockData);
                    if(block === undefined)
                        return reject( new Error('getblock() return undefined'));
                    if(block.error)
                        return reject( new Error(`getblock() return error ${block.error}`));
                    if(!block.result || !block.result.tx)
                        return reject( new Error(`getblock() return no result by hash ${hash}`));
                    blockM = block.result;
                    return _getBlockTxsJson(blockM.tx);
                })
                .then(txs => {
                    if(!txs) {
                        return reject(new Error(`getblock()
                    return empty result for block hash: ${hash}`));
                    } else {
                        blockM.tx = txs;
                        return resolve(blockM);
                    }
                })
                .catch(err => {
                    return reject( new Error(`getblock() return error ${err}`));
                });
        } catch  (error) {
            return reject( new Error(`getblock() return error ${error}`));
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
    } catch (err) {console.dir(err);
        return null;
    }
}
function getBlockHash(numBlock) {
    return new Promise((resolve, reject) =>{
        const params = _rpcParams('getblockhash',[numBlock]);
        _sendAPI(params)
            .then(block => {
                let jblock = JSON.parse(block);
                if(block === undefined)
                    return reject( new Error('getblockhash() return undefined'));
                if(jblock.error)
                    return reject( new Error(`getblockhash() return error ${jblock.error}`));
                if(!jblock.result)
                    return reject( new Error(`getblockhash() return no result by blockNumber ${numBlock}`));
                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new Error(`getblockhash() return error ${err}`));
            })
    });
}
function getTransactionById(id) {
    return new Promise((resolve, reject) => {
        const params = _rpcParams('getrawtransaction', [id, 1]);
        _sendAPI(params)
            .then(resp => {
                if(resp === undefined)
                    return reject( new Error('ZEC getRawTransaction() return undefined'));
                const tx = JSON.parse(resp);
                if(tx.error)
                    return (tx.error.code === -5)
                        ? resolve({txid: id, vin: [], vout: []})
                        : reject( new Error(`ZEC getRawTransaction() return error ${tx.error}`));
                if(!tx.result)
                    return reject( new Error(`ZEC getRawTransaction() return no result by id: ${id}`));
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
                                            return ad || '';
                                        }) : []
                                }
                            }
                        }) :
                        [],
                    vjoinsplit: tx.result.vjoinsplit ?
                        tx.result.vjoinsplit.map(vjs => {
                            return {
                                vpub_old: vjs.vpub_old,
                                vpub_new: vjs.vpub_new,
                                anchor: vjs.anchor,
                                nullifiers: vjs.nullifiers.map(n => { return n }),
                                commitments: vjs.commitments.map(c => { return c }),
                                onetimePubKey: vjs.onetimePubKey,
                                randomSeed: vjs.randomSeed,
                                macs: vjs.macs.map(m => { return m }),
                                proof: vjs.proof,
                                ciphertexts: vjs.ciphertexts.map(cf => { return cf })
                            }
                        })
                        : []
                });
            })
            .catch(err => {
                return reject( new Error(`ZEC getRawTransaction() return error ${err}`));
            })
    })
}
function _rpcParams(method, params) {
    return {
        method: 'post',
        url: 'http://' + zecConfig.host + ':' + zecConfig.port,
        data: {
            'jsonrpc': '1.0',
            'id':'12',
            'method': method,
            'params': params
        },
        headers: [
            {
                key: 'Content-Type',
                value: 'application/json'
            },
            {
                key: 'Authorization',
                value: 'Basic ' + b64.encode(zecConfig.user + ':' + zecConfig.pass)
            }
        ]
    };
}
function _sendAPI(data) {
    return new Promise((resolve, reject) => {
        try {
            const xhr = new XHR();
            xhr.open(data.method, data.url);
            if(data.headers) for(let i = 0;i < data.headers.length;i++)
                xhr.setRequestHeader(data.headers[i].key,data.headers[i].value);
            xhr.onload = () => {
                return resolve(xhr.responseText);
            };
            xhr.onerror = () => {
                ZecError.error(`${new Date()} zcash node error ${xhr.responseText}`);
                return reject('Service error');
            };
            xhr.send(data.data?JSON.stringify(data.data):null);
        } catch (err) {
            ZecError.error(`${new Date()} zcash sendAPI error ${err}`);
            return reject('Service error');
        }
    })
}
function _getVoutTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            ZECTransaction.aggregate()
                .lookup({
                    from: 'zectransactions',
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


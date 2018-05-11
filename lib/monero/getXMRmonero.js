const xmrConfig = require(`../../config/config.json`).XMRRpc,
    sendRPC = require(appRoot + '/lib/utils').sendRPC;
require('../../models/MoneroTransactionModel');
const XMRTransaction = mongoose.model('xmrtransactions');

//Intel logger setup
const intel = require('intel');
const XmrError = intel.getLogger('XmrError');
XmrError.setLevel(XmrError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/xmr/error.log`));

function getTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            XMRTransaction.find()
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
function getTransactionsFromBlock(numBlock) {
    return new Promise((resolve, reject) => {
        try {
            getBlockData(numBlock)
                .then(blockData => {
                    const txs = [];
                    if (!blockData) {
                        return reject(new Error(`No data in block:${numBlock}`));
                    } else {
                        return resolve(blockData);
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
function getBlockHash(height) {
    return new Promise((resolve, reject) =>{
        const params = _rpcParams('on_getblockhash',[height], 'json_rpc');
        _sendAPI(params)
            .then(block => {
                const jblock = JSON.parse(block);
                if(block === undefined)
                    return reject( new Error('on_getblockhash() return undefined'));
                if(jblock.error)
                    return reject( new Error(`on_getblockhash() return error ${jblock.error}`));
                if(!jblock.result)
                    return reject( new Error(`on_getblockhash() return no result by hash ${hash}`));
                //console.dir(jblock.result);
                jblock.result.json = JSON.parse(jblock.result.json);
                return resolve(jblock.result);
            })
            .catch(err => {
                return reject( new Error(`getBlockHash() return error ${err}`));
            })
    });
}
function getBlockData(height) {
    return new Promise((resolve, reject) =>{
        const params = _rpcParams('getblock',{height: height}, 'json_rpc');
        _sendAPI(params)
            .then(block => {
                const jblock = JSON.parse(block);
                if(block === undefined)
                    return reject( new Error('getblock() return undefined'));
                if(jblock.error)
                    return reject( new Error(`getblock() return error ${jblock.error}`));
                if(!jblock.result)
                    return reject( new Error(`getblock() return no result by hash ${hash}`));
                //console.dir(jblock.result);
                //jblock.result.json = JSON.parse(jblock.result.json);
                const getTxs = async function (hashes) {
                    return await getTxsByHash(hashes);
                };
                getTxs(jblock.result.tx_hashes)
                    .then(txs => {
                        try {
                            let tx = {};
                            let i = 0;
                            return resolve(txs.map(t => {console.dir(tx.extra);
                                tx = Object.assign(t.as_json,{
                                    output_indices: t.output_indices,
                                    block_height:   t.block_height,
                                    block_timestamp:t.block_timestamp,
                                    hash:           t.tx_hash
                                });
                                return {
                                    blockheight:    tx.block_height,
                                    timestamp:      tx.block_timestamp,
                                    hash:           tx.hash,
                                    output_indices: tx.output_indices,
                                    version:        tx.version,
                                    unlock_time:    tx.unlock_time,
                                    vin:            tx.vin ?
                                        tx.vin.map(vin => {
                                            return {
                                                key: {
                                                    amount:     vin.key.amount,
                                                    k_image:    vin.key.k_image,
                                                    key_offsets:vin.key.key_offsets
                                                }
                                            }
                                        }) : [],
                                    vout:           tx.vout ?
                                        tx.vout.map(vout => {
                                            return {
                                                amount:     vout.amount,
                                                target:{
                                                    key:    vout.target.key
                                                }
                                            }
                                        }) : [],
                                    extra:          tx.extra,
                                    rct_signatures:  {
                                                ecdhInfo:   tx.rct_signatures.ecdhInfo ?
                                                    tx.rct_signatures.ecdhInfo.map(ecdh => {
                                                        return {
                                                            amount: ecdh.amount,
                                                            mask:   ecdh.mask
                                                        }
                                                    }) : [],
                                                outPk:      tx.rct_signatures.outPk ?
                                                    tx.rct_signatures.outPk.map(outPk => {
                                                        return outPk
                                                    }) : [],
                                                txnFee:     tx.rct_signatures.txnFee,
                                                tipe:       tx.rct_signatures.type
                                            },
                                    rctsig_prunable:{
                                        /*mgs:    tx.rctsig_prunable &&
                                        tx.rctsig_prunable.MGs ?
                                            tx.rctsig_prunable.MGs.map(mgs => {
                                                return {
                                                    cc:     mgs.cc,
                                                    ss:     mgs.ss
                                                }
                                            }) : [],
                                        rangeSigs:      tx.rctsig_prunable &&
                                        tx.rctsig_prunable.rangeSigs ?
                                            tx.rctsig_prunable.rangeSigs.map(rs => {
                                                return {
                                                    Ci:     rs.Ci,
                                                    asig:   rs.asig
                                                }
                                            }) : []*/
                                    }
                                }
                            }));
                        } catch (er) {console.dir(er);reject(er);}
                    })
                    .catch(error => {
                        return reject( new Error(`getblock() return error ${error}`));
                    });
            })
            .catch(err => {
                return reject( new Error(`getblock() return error ${err}`));
            })
    });
}
function getTxsByHash(hashes) {
    return new Promise((resolve, reject) =>{
        const params = {
            method: 'post',
                url: 'http://' + xmrConfig.host + ':' + xmrConfig.port + '/gettransactions',
                data: {
                "txs_hashes": hashes,
                "decode_as_json": true
            },
            headers: [
                {
                    key: 'Content-Type',
                    value: 'application/json'
                }
            ]
        };
        _sendAPI(params)
            .then(resp => {
                if(resp === undefined)
                    return reject( new Error(params.url + ' return undefined'));
                const txs = JSON.parse(resp);
                if(txs.error)
                    return reject( new Error(`${params.url} return error ${txs.error}`));
                if(!txs['txs'])
                    return reject( new Error(`${params.url} return no result`));
                txs['txs'].map(tx => {
                    tx['as_json'] = JSON.parse(tx['as_json']);
                });
                return resolve(txs.txs);
            })
            .catch(err => {
                return reject( new Error(`getTxsByHash return error ${err}`));
            })
    });
}
function _rpcParams(method, params, prefix) {
    return {
        method: 'post',
        url: 'http://' + xmrConfig.host + ':' + xmrConfig.port + '/' + prefix,
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
            }/*,
            {
                key: 'Authorization',
                value: 'Basic ' + b64.encode(xmrConfig.user + ':' + xmrConfig.pass)
            }*/
        ]
    };
}
module.exports = {
    getBlockCount:              getBlockCount,
    getBlockData:               getBlockData,
    getBlockHash:               getBlockHash,
    getTransactionsFromBlock:     getTransactionsFromBlock,
    getBalance:                 getBalance,
    getUTXOs:                   getUTXOs,
    getTxsByAddress:            getTxsByAddress,
    sendRawTransaction:         sendRawTransaction,
    getTxsByHash:               getTxsByHash
};
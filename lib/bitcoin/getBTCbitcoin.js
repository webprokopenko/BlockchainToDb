const config = require(`../../config/config.json`).BTCRpc,
    b64 = require('base-64'),
    XHR = require('xmlhttprequest').XMLHttpRequest,
    Utils = require('../../lib/bitcoin/utilsBTC');
    const mongodbConnectionString = require('../../config/config.json').mongodbConnectionString;
    global.mongoose = require('mongoose');
    mongoose.connect(mongodbConnectionString);
    require('../../models/BitcoinTransactionModel');
    const BTCTransaction = mongoose.model('btctransactions');

function getUTXOs(address) {
    return new Promise((resolve, reject) => {

    });
}
function getBalance(address) {
    return new Promise((resolve, reject) => {
        try {
            let balance = 0;
            _getTransitTxs(address)
                .then(txs => {
                    //console.dir(txs[0].vout);
                    //console.dir(txs[0].vout[0].scriptPubKey.addresses);
                    txs.map(tx => {
                        tx.vout.map(tv => {
                            if (tv.scriptPubKey.addresses.indexOf(address) >= 0)
                                balance += tv.value;
                        });
                    });
                    return true;
                })
                .then(nx => {console.log('nx');
                    if (!nx) {
                        return reject(nx);
                    } else {
                        return _getCoinbaseTxs(address);
                    }
                })
                .then(ctxs => {console.log(ctxs.length);
                    if (!ctxs) {
                        return reject(ctxs);
                    } else {
                        ctxs.map(ctx => {
                            ctx.vout.map(tv => {
                                if (tv.scriptPubKey.addresses.indexOf(address) >= 0)
                                    balance += tv.value;
                            });
                        });
                        return resolve(balance);
                    }
                })
                .catch(error => {
                    return reject(error);
                })
        } catch (err) {
            return reject(err);
        }
    })
}
function sendRawTransaction(hex){
    return new Promise((resolve, reject) =>{
        const params = _rpcParams('sendrawtransaction', [hex]);
        _sendAPI(params)
            .then(txid => {
                return resolve(txid);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
function getTransactionsFromBTC(numBlock) {
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
            return reject(new Error(`Error getTransactionsFromBTC:${err}`));
        }
    })
}
function getBlockCount(){
    return new Promise((resolve, reject) =>{
        const params = _rpcParams('getblockcount');
        _sendAPI(params)
            .then(block => {
                let jblock = JSON.parse(block);
                if(block === undefined)
                    return reject( new Error('getBlockCount() return undefined'));
                if(jblock.error)
                    return reject( new Error(`getBlockCount() return error ${block}`));
                if(!jblock.result)
                    return reject( new Error(`getBlockCount() return empty result ${block}`));
                
                return resolve(jblock);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
function getBlockData(hash){
    return new Promise((resolve, reject) =>{
        const params = _rpcParams('getblock',[hash,2]);
        _sendAPI(params)
            .then(block => {
                let jblock = JSON.parse(block);
                if(block === undefined)
                    return reject( new Error('getBlockCount() return undefined'));
                if(jblock.error)
                    return reject( new Error(`getBlockCount() return error ${block}`));
                if(!jblock.result)
                    return reject( new Error(`getBlockCount() return empty result ${block}`));
                //console.dir(jblock.result);
                return resolve(jblock.result);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
function getBlockHash(numBlock){
    return new Promise((resolve, reject) =>{
        const params = _rpcParams('getblockhash',[numBlock]);
        _sendAPI(params)
            .then(block => {
                let jblock = JSON.parse(block);
                if(block === undefined)
                    return reject( new Error('getBlockCount() return undefined'));
                if(jblock.error)
                    return reject( new Error(`getBlockCount() return error ${block}`));
                if(!jblock.result)
                    return reject( new Error(`getBlockCount() return empty result ${block}`));
                
                
                return resolve(jblock.result);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
function _rpcParams(method, params) {
    return {
        method: 'post',
        url: 'http://' + config.host + ':' + config.port,
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
                value: 'Basic ' + b64.encode(config.user + ':' + config.pass)
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
            xhr.onerror = (err) => {
                return reject(err);
            };
            xhr.send(data.data?JSON.stringify(data.data):null);
        } catch (err) {
            return reject(err);
        }
    })
}
function _getTransitTxs(address) {
    return new Promise((resolve, reject) => {
        try {
            BTCTransaction.aggregate()
                .lookup({
                    from: 'btctransactions',
                    localField: 'vin.txid',
                    foreignField: 'txid',
                    as: 'txvin' //0.7869825 - vin for ebbdd217ec6f0842cfadc920a0c0f25f8c2fbac4634cd5abae1e00c0e8a252b9
                })
                .project({
                    _id: 0,
                    blockhash: 1,
                    blockheight: 1,
                    txid: 1,
                    vin: {
                        txid: 1
                    },
                    vout: 1,
                    txvin: 1
                })
                .match({
                    $and: [
                        {'vout.scriptPubKey.addresses': address},
                        {'txvin.vout.scriptPubKey.addresses': address}
                    ]
                })
                .sort({'blockheight': -1})
                .limit(1)
                .exec()
                .then(tx => {
                    return resolve(tx);
                })
                .catch(error => {
                    return reject(error);
                })
        } catch (err) {
            return reject(err);
        }
    })
}
function _getCoinbaseTxs(address) {
    return new Promise((resolve, reject) => {
        try {
            BTCTransaction.aggregate()
                .lookup({
                    from: 'btctransactions',
                    localField: 'vin.txid',
                    foreignField: 'txid',
                    as: 'txvin' //0.7869825 - vin for ebbdd217ec6f0842cfadc920a0c0f25f8c2fbac4634cd5abae1e00c0e8a252b9
                })
                .project({
                    _id: 0,
                    blockhash: 1,
                    blockheight: 1,
                    txid: 1,
                    vin: {
                        txid: 1
                    },
                    vout: 1,
                    txvin: 1
                })
                .match({
                    $and: [
                        {'vout.scriptPubKey.addresses': address},
                        {'txvin.vout.scriptPubKey.addresses': {$not:{$eq:address}}}
                    ]
                })
                .sort({'blockheight': -1})
                .limit(1)
                .exec()
                .then(cbtxs => {
                    if (!cbtxs) {
                        return reject(cbtxs);
                    } else {console.log('cbtx ' + cbtxs.length);console.dir(cbtxs);
                        _checkCoinbaseTxs(cbtxs, address)
                            .then(r => {
                                console.log('r r r ' + r);
                                return resolve(r);
                            })
                            .catch(error => {console.dir(error);
                                return reject(error)
                            });
                    }
                })
                .then(tchecks => {console.log('tcheck');console.dir(tchecks);
                    return tchecks ? resolve(tchecks) : reject(tchecks);
                })
                .catch(error => {
                    return reject(error);
                })
        } catch (err) {
            return reject(err);
        }
    })
}
function _checkCoinbaseTxs(cbtxs, address) {
    return new Promise((resolve, reject) => {
        try {
            const txs = [];
            //cbtxs.map(cbtx => {console.log(cbtx.txid);
                BTCTransaction.aggregate()
                    .lookup({
                        from: 'btctransactions',
                        localField: 'txid',
                        foreignField: 'vin.txid',
                        as: 'txvin' //0.7869825 - vin for ebbdd217ec6f0842cfadc920a0c0f25f8c2fbac4634cd5abae1e00c0e8a252b9
                    })
                    .project({
                        _id: 0,
                        blockhash: 1,
                        blockheight: 1,
                        txid: 1,
                        vin: {
                            txid: 1
                        },
                        vout: 1,
                        txvin: 1
                    })
                    .match({
                        $and: [
                            //{'vout.scriptPubKey.addresses': {$not:{$eq:address}}},
                            {'txvin.txid': cbtxs[0].txid}
                        ]
                    })
                    .exec()
                    .then(txs => {console.log('vin ' + txs.length);
                        return reject([]);
                    })
                    .catch(error => {console.log('error ' + error);
                        return reject(error);
                    });//console.log('xxxx ' + txs.length);
                //return resolve(txs);
            //});
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
    getTransactionsFromBTC:     getTransactionsFromBTC,
    getBalance:                 getBalance
};

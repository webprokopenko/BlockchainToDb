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
async function getBalance(address) {
        try {
            let balance = 0,
                sortTxs = {};
            const txs = await _getVoutTxsByAddress(address);
                sortTxs = await _sortTxsByCategory(txs, address);
            let bal = await _checkCategory1(sortTxs.cat1, address);
            if(bal.balance) balance += bal.balance;
            bal = _checkCategory2(sortTxs.cat2, address);
            if(bal.balance) balance += bal.balance;
            return balance;
        } catch (error) {
            return {error: error};
    }
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
function _getVoutTxsByAddress(address) {
    return new Promise((resolve, reject) => {
        try {
            BTCTransaction.aggregate()
                .lookup({
                    from: 'btctransactions',
                    localField: 'vin.txid',
                    foreignField: 'txid',
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
                .match({
                    'vout.scriptPubKey.addresses': address
                })
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
function _getVinTxsById(id) {
    return new Promise((resolve, reject) => {
        return BTCTransaction.find()
            .where({
                'vin.txid':id
            })
            .limit(1)
            .then(txs => {
                return resolve(txs);
            })
            .catch(error => {
                return reject(error);
            })
    })
}
function _sortTxsByCategory(txs, address) {
    return new Promise((resolve, reject) => {
        try {
            const sortTxs = {
                cat1: [],
                cat2: []
            };
            let indCat1 = true;
            txs.map(tx => {
                indCat1 = true;
                for (let i = 0; i < tx.txvin.length; i++) {
                    tx.txvin[i].vout.map(tvout => {
                        if (tvout.scriptPubKey.addresses.indexOf(address) >= 0) {
                            sortTxs.cat2.push(tx);
                            indCat1 = false;
                            i = tx.txvin.length;
                        }
                    })
                }
                if (indCat1) sortTxs.cat1.push(tx);
            });
            return resolve(sortTxs);
        } catch (err) {
            return reject(err);
        }
    })
}
async function _checkCategory1(txs, address) {
        async function check (ttxs) {
            try {
                let balance = 0;
                await  Promise.all(ttxs.map(async c1 => {
                    const vintxs = await _getVinTxsById(c1.txid);
                    let indSelf = false;console.dir(vintxs.length);
                    if (vintxs.length > 0) {
                        vintxs.map(txc => {
                            console.log(txc.txid);
                            txc.vout.map(txcvout => {
                                if(txcvout.scriptPubKey.addresses.indexOf(address) >= 0)
                                    indSelf = true;
                            })
                        });
                    }
                    if (vintxs.length === 0 || indSelf) c1.vout.map(c1vout => {
                        if(c1vout.scriptPubKey.addresses.indexOf(address) >= 0) {
                            balance += c1vout.value;
                        }
                    });
                }));
                return {balance: balance};
            } catch (error) {
                return {error: error};
            }
        }
        return await check(txs);
}
function _checkCategory2(txs, address) {
        try {
            let balance = 0;
            txs.sort((a,b) => {
                return a.blockheight - b.blockheight;
            });
            txs[txs.length - 1]
                .vout.map(cat2vout => {
                if(cat2vout.scriptPubKey.addresses.indexOf(address) >= 0)
                    balance += cat2vout.value;
            });
            return {balance:balance};
        } catch (err) {
            return {error:err};
        }
}
module.exports = {
    sendRawTransaction:         sendRawTransaction,
    getBlockCount:              getBlockCount,
    getBlockData:               getBlockData,
    getBlockHash:               getBlockHash,
    getTransactionsFromBTC:     getTransactionsFromBTC,
    getBalance:                 getBalance
};

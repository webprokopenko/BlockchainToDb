const config = require(`../../config/config.json`).BTCRpc,
    b64 = require('base-64'),
    XHR = require('xmlhttprequest').XMLHttpRequest,
    Utils = require('../../lib/bitcoin/utilsBTC');

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
                    if (!blockData || !(blockData.length > 0)) {
                        return reject(new Error(`No data in block:${numBlock}`));
                    } else {
                        blockData.tx.map(btx => {
                            const tx = {};
                            tx.blockheight = blockData.height;
                            tx.blockhash = blockData.hash;
                            tx.timestamp = blockData.time;
                            tx.id = btx.txid;
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
                                tvout.scriptPubKey = Object.assign({},txvout.scriptPubKey);
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
                console.dir(jblock.result);
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
module.exports = {
    sendRawTransaction:         sendRawTransaction,
    getBlockCount:              getBlockCount,
    getBlockData:               getBlockData,
    getBlockHash:               getBlockHash,
    getTransactionsFromBTC:     getTransactionsFromBTC
};

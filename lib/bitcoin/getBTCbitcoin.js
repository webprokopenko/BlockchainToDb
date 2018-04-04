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
function getBlockHash(numBlock) {
    return new Promise((resolve, reject) => {
        try {
            const params = _rpcParams('getblockhash',[numBlock]);
            _sendAPI(params)
                .then(hash => {
                    return resolve(hash);
                })
                .catch(err => {
                    return reject(err);
                })
        } catch (err) {
            return reject(new Error(`Error with ${err}`));
        }
    });
}
function getBlockData(numBlock) {
    return new Promise((resolve, reject) => {
        try {
            getBlockHash(numBlock)
                .then(blockHash => {
                    const params = _rpcParams('getblock',[blockHash, 2]);
                    return _sendAPI(params)
                })
                .then(blockData => {
                    if (!blockData || !blockData.result) {
                        return reject(new Error(`No block data with:${numBlock}, error:${blockData.error}`));
                    } else {
                        return resolve(blockData.result)
                    }
                })
                .catch(err => {
                    return reject(err);
                })
        } catch (err) {
            return reject(new Error(`Error with ${err}`));
        }
    });
}
function getTransactionsFromBTC(numBlock) {
    return new Promise((resolve, reject) => {
        try {

        } catch (err) {
            return reject(new Error(`Error getTransactionsFromBTC:${err}`));
        }
    })
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
    getTransactionsFromBTC:     getTransactionsFromBTC,
};

const bitcoin = require('bitcoin'),
    config = require(`../../config/config.json`).BTCRpc,
    b64 = require('base-64'),
    XHR = require('xmlhttprequest').XMLHttpRequest;

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
    sendRawTransaction: sendRawTransaction,
    getBlockCount:      getBlockCount,
    getBlockData:       getBlockData,
    getBlockHash:       getBlockHash
};

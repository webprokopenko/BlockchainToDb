const rpcError = require('../errors/RpcError');
module.exports = class BitKindRpc {
    constructor(config) {
        this.config = config;
    }
    sendRPC(method, config, params = [], prefix = '') {
        return new Promise((resolve, reject) => {
            try {
                const data = _rpcParams(method, prefix, params, config);
                const xhr = new XHR();
                xhr.open(data.method, data.url);
                while(data.headers.length) {
                    xhr.setRequestHeader(data.headers[0].key, data.headers[0].value);
                    data.headers.shift();
                }
                xhr.onload = () => {
                    return resolve(xhr.responseText);
                };
                xhr.onerror = () => {
                    return reject(xhr.responseText);
                };
                xhr.send(data.data?JSON.stringify(data.data):null);
            } catch (err) {
                return reject(err);
            }
        })
    };
    getBlockCount() {
        return new Promise((resolve, reject) => {
            this.sendRPC('getblockcount', this.config)
                .then(block => {
                    let jblock = JSON.parse(this.isJson(block) ? block : '{}');
                    if (jblock.error)
                        return reject(new rpcError(`getblockcount return error ${jblock.error}`, 'btc', jblock.error.code));
                    if (!jblock.result)
                        return reject(new rpcError(`getblockcount return no result`, 'btc', 200));

                    return resolve(jblock.result);
                })
                .catch(err => {
                    return reject(new rpcError(`getBlockCount return: ${err}`, 'btc', 202));
                })
        });
    }
    getBlockData(hash) {
        return new Promise((resolve, reject) => {
            this.sendRPC('getblock', this.config, [hash, 2])
                .then(block => {
                    let jblock = JSON.parse(this.isJson(block) ? block : '{}');
                    if (jblock.error)
                        return reject(new rpcError(`getblock return error ${block.error}`, 'btc', jblock.error.code));
                    if (!jblock.result)
                        return reject(new rpcError(`getblock return empty result by hash ${hash}`, 'btc', 200));
                    return resolve(jblock.result);
                })
                .catch(err => {
                    return reject(new rpcError('getBlockData return: ' + err, 'btc', 202));
                })
        });
    }
    getBlockHash(numBlock) {
        return new Promise((resolve, reject) => {
            this.sendRPC('getblockhash', this.config, [numBlock])
                .then(block => {
                    let jblock = JSON.parse(this.isJson(block) ? block : '{}');
                    if (jblock.error)
                        return reject(new rpcError(`getBlockCount return error ${jblock.error}`, 'btc', jblock.error.code));
                    if (!jblock.result)
                        return reject(new rpcError(`getBlockCount return no result`, 'btc', 200));
                    return resolve(jblock.result);
                })
                .catch(err => {
                    return reject(new rpcError(`getBlockHash() return: ${err}`, 'btc', 202));
                })
        });
    }
    async getRawTransaction(txid) {
        try {
            const tx = await sendRPC('getrawtransaction', btcConfig, [txid, 1]);
            let rawtx = JSON.parse(this.isJson(tx) ? tx : '{}');
            if (rawtx.error) {
                throw new rpcError(`getrawtransaction return error ${rawtx.error}`, 'btc', rawtx.error.code);
            }
            if (!rawtx.result)
                throw new rpcError(`getrawtransaction return empty result by hash ${txid}`, 'btc', 200);
            return rawtx.result;
        } catch (err) {
            throw new rpcError('getrawtransaction return: ' + err, 'btc', 202);
        }
    }
     isJson(str){
        try {
            return !!JSON.parse(str);
        } catch (e) {
            return false;
        }
    }
}
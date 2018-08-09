const rpcError = require('../errors/RpcError');
const b64 = require('base-64');
const XHR = require('xmlhttprequest').XMLHttpRequest;

module.exports = class BitKindRpc {
    constructor(config,blockchain) {
        this.config = config;
        this.blockchain = blockchain;
    }
    sendRPC(method, config, params = [], prefix = '') {
        return new Promise((resolve, reject) => {
            try {
                const data = this._rpcParams(method, prefix, params, config);
                const xhr = new XHR();
                xhr.open(data.method, data.url);
                while (data.headers.length) {
                    xhr.setRequestHeader(data.headers[0].key, data.headers[0].value);
                    data.headers.shift();
                }
                xhr.onload = () => {
                    return resolve(xhr.responseText);
                };
                xhr.onerror = () => {
                    return reject(xhr.responseText);
                };
                xhr.send(data.data ? JSON.stringify(data.data) : null);
            } catch (err) {
                return reject(err);
            }
        })
    };
    _rpcParams(method, prefix, params, config) {
        const headers = [{
            key: 'Content-Type',
            value: 'application/json'
        }];
        if(config.user && config.pass) headers.push({
            key: 'Authorization',
            value: 'Basic ' + b64.encode(config.user + ':' + config.pass)
        });
        return {
            method: 'post',
            url: 'http://' + config.host + ':' + config.port + '/' + prefix,
            data: {
                'jsonrpc': config.rpc_vesion || '2.0',
                'id':'12',
                'method': method,
                'params': params
            },
            headers: headers
        };
    }
    getBlockCount() {
        return new Promise((resolve, reject) => {
            this.sendRPC('getblockcount', this.config)
                .then(block => {
                    let jblock = JSON.parse(this.isJson(block) ? block : '{}');
                    if (jblock.error)
                        return reject(new rpcError(`getblockcount return error ${jblock.error}`,this.blockchain, jblock.error.code));
                    if (!jblock.result)
                        return reject(new rpcError(`getblockcount return no result`, this.blockchain, 200));

                    return resolve(jblock.result);
                })
                .catch(err => {
                    return reject(new rpcError(`getBlockCount return: ${err}`, this.blockchain, 202));
                })
        });
    }
    getBlockData(hash) {
        return new Promise((resolve, reject) => {
            this.sendRPC('getblock', this.config, [hash, 2])
                .then(block => {
                    let jblock = JSON.parse(this.isJson(block) ? block : '{}');
                    if (jblock.error)
                        return reject(new rpcError(`getblock return error ${block.error}`, this.blockchain, jblock.error.code));
                    if (!jblock.result)
                        return reject(new rpcError(`getblock return empty result by hash ${hash}`, this.blockchain, 200));
                    return resolve(jblock.result);
                })
                .catch(err => {
                    return reject(new rpcError('getBlockData return: ' + err, this.blockchain, 202));
                })
        });
    }
    getBlockHash(numBlock) {
        return new Promise((resolve, reject) => {
            this.sendRPC('getblockhash', this.config, [numBlock])
                .then(block => {
                    let jblock = JSON.parse(this.isJson(block) ? block : '{}');
                    if (jblock.error)
                        return reject(new rpcError(`getBlockCount return error ${jblock.error}`, this.blockchain, jblock.error.code));
                    if (!jblock.result)
                        return reject(new rpcError(`getBlockCount return no result`, this.blockchain, 200));
                    return resolve(jblock.result);
                })
                .catch(err => {
                    return reject(new rpcError(`getBlockHash() return: ${err}`, this.blockchain, 202));
                })
        });
    }
    async getRawTransaction(txid) {
        try {
            const tx = await this.sendRPC('getrawtransaction', this.config, [txid, 1]);
            let rawtx = JSON.parse(this.isJson(tx) ? tx : '{}');
            if (rawtx.error) {
                throw new rpcError(`getrawtransaction return error ${rawtx.error}`, this.blockchain, rawtx.error.code);
            }
            if (!rawtx.result)
                throw new rpcError(`getrawtransaction return empty result by hash ${txid}`, this.blockchain, 200);
            return rawtx.result;
        } catch (err) {
            throw new rpcError('getrawtransaction return: ' + err, this.blockchain, 202);
        }
    }
    async getTransactionsFromBlock(numBlock) {
        try {
            const blockHash = await this.getBlockHash(numBlock);
            const blockData = await this.getBlockData(blockHash);
            const txs = [];
            if (!blockData.tx) {
                throw new rpcError(`No data in block:${numBlock}`, this.blockchain, 200);
            }
            while (blockData.tx.length > 0) {
                const btx = blockData.tx[0];
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
                while (btx.vin.length > 0) {
                    const txvin = btx.vin[0];
                    const tvin = {};
                    const tv = (txvin.txid) ? await this.getRawTransaction(txvin.txid) : null;
                    tvin.txid = txvin.txid;
                    tvin.vout = txvin.vout;
                    if (tv
                        && tv.vout[txvin.vout]
                        && tv.vout[txvin.vout].scriptPubKey
                        && tv.vout[txvin.vout].scriptPubKey.addresses
                    ) {
                        tvin.addresses = tv.vout[txvin.vout].scriptPubKey.addresses;
                        tvin.value = tv.vout[txvin.vout].value;
                    } else {
                        tvin.addresses = [];
                        tvin.value = 0;
                    }
                    tvin.scriptSig = Object.assign({}, txvin.scriptSig);
                    tvin.coinbase = txvin.coinbase;
                    tvin.sequence = txvin.sequence;
                    tx.vin.push(tvin);
                    btx.vin.shift();
                }
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
                blockData.tx.shift();
            }
            return txs;
        } catch (err) {
            throw new rpcError(`Error getTransactionsFromBlock: ${err}`, this.blockchain, 203);
        }
    }
    isJson(str) {
        try {
            return !!JSON.parse(str);
        } catch (e) {
            return false;
        }
    }
}
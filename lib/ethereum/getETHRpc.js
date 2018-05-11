const Units = require('ethereumjs-units');
const math = require('mathjs');
const RpcConnectOption = require(`${appRoot}/config/config.json`).ETHRpc;
const sendRPC = require(`${appRoot}/lib/utils`).sendRPC;
const utils = require(`${appRoot}/lib/ethereum/utilsETH`);

//Intel logger setup
const intel = require('intel');
const EthError = intel.getLogger('EthError');
EthError.setLevel(EthError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/eth/error.log`));


function getGasFromTransactionHash(hash) {
    return new Promise((resolve, reject) => {
        try {
            sendRPC('eth_getTransactionReceipt', RpcConnectOption, [hash])
                .then(resp => {
                    const res = JSON.parse(resp);
                    if (!res)
                        return reject(new Error(`Response body empty`));
                    if (res.error)
                        return reject(new Error(`Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                    if (!res.result)
                        return reject(new Error(`Result body empty`));
                    if (!res.result.gasUsed)
                        return reject(new Error('Result gasUsed from transaction empty'));

                    resolve(utils.convertHexToInt(res.result.gasUsed));
                })
                .catch(err => {
                    return reject(new Error('eth_getTransactionReceipt Error from geth:' + err));
                })
        } catch (error) {
            return reject(new Error('getGasFromTransactionHash Error:' + error));
        }
    })
}
function getBlockData(numBlock) {
    return new Promise((resolve, reject) => {
        try {
            sendRPC('eth_getBlockByNumber', RpcConnectOption, [utils.convertNumberToHex(numBlock), true])
                .then(resp => {
                    const res = JSON.parse(resp);
                    if (!res)
                        return reject(new Error(`Response body empty`));
                    if (res.error)
                        return reject(new Error(`Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                    if (!res.result.transactions)
                        return reject(new Error(`Transactions empty`));

                    resolve(res.result);
                })
                .catch(err => {
                    return reject(new Error(`eth_getBlockByNumber Error from geth: ${err}`));
                })
        } catch (error) {
            return reject(new Error(`getBlockData Error: ${error}`));
        }
    })
}
async function getTransactionFromETH(numBlock) {
    const blockData = await getBlockData(numBlock);
    let blockTransaction = [];
    await Promise.all(blockData.transactions.map(async (element) => {
        let transaction = {};
        transaction.from = element.from;
        transaction.to = element.to;
        //block ethereum 1100009 bad value
        element.gas = math.bignumber(utils.convertHexToInt(element.gas)).toFixed();
        element.gasPrice = math.bignumber(utils.convertHexToInt(element.gasPrice)).toFixed();
        transaction.value = Units.convert(math.bignumber(utils.convertHexToInt(element.value)).toFixed(), 'wei', 'eth'); //unexpect 0x26748d96b29f5076000 value not support
        transaction.fee = Units.convert(element.gas * element.gasPrice, 'wei', 'eth');
        transaction.hash = element.hash;
        let gasUse = math.bignumber(await getGasFromTransactionHash(element.hash));
        let gasPrice = math.bignumber(Units.convert(element.gasPrice, 'wei', 'eth'));
        transaction.fee = math.multiply(gasPrice, gasUse).toFixed();
        transaction.timestamp = utils.convertHexToInt(blockData.timestamp);
        transaction.blockNum = utils.convertHexToInt(element.blockNumber);
        blockTransaction.push(transaction);
    }));
    return blockTransaction.length > 0 ? blockTransaction : null;
}
async function getTransactionCountETH(numBlock) {
    const blockData = await getBlockData(numBlock);
    return blockData.transactions.length;
}
function getBlockNumber(param) {
    return new Promise((resolve, reject) => {
        try {
            if (!param || (param !== 'pending'))
                param = 'latest';
            sendRPC('eth_getBlockByNumber', RpcConnectOption, [param, true])
                .then(resp => {
                    const res = JSON.parse(resp);
                    if (!res)
                        return reject(new Error(`getBlockNumber Response body empty`));
                    if (res.error)
                        return reject(new Error(`getBlockNumber Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                    if (!res.result.number)
                        return reject(new Error(`getBlockNumber Block number empty`));

                    resolve(parseInt(utils.convertHexToInt(res.result.number)));
                })
                .catch(err => {
                    return reject(new Error(`eth_getBlockByNumber Error from geth: ${err}`));
                })
        } catch (error) {
            return reject(new Error(`getBlockNumber Error: ${error}`));
        }
    })
}
function getGasPrice() {
    return new Promise((resolve, reject) => {
        try {
            sendRPC('eth_gasPrice', RpcConnectOption)
                .then(resp => {
                    const res = JSON.parse(resp);
                    if (!res)
                        return reject(new Error(`getGasPrice Response body empty`));
                    if (res.error)
                        return reject(new Error(`getGasPrice Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                    if (!res.result)
                        return reject(new Error(`getGasPrice result empty`));
                    resolve(res.result);
                })
                .catch(err => {
                    return reject(new Error(`eth_gasPrice Error from geth: ${err}`));
                })
        } catch (error) {
            return reject(new Error(`getGasPrice Error: ${error}`));
        }
    })
}
function getLatestBlock() {
    return new Promise((resolve, reject) => {
        try {
            sendRPC('eth_getBlockByNumber', RpcConnectOption, ['latest', true])
                .then(resp => {
                    const res = JSON.parse(resp);
                    if (!res)
                        return reject(new Error(`RPC eth_getBlockByNumber Response body empty`));
                    if (res.error)
                        return reject(new Error(`RPC eth_getBlockByNumber Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                    if (!res.result)
                        return reject(new Error(`RPC eth_getBlockByNumber result empty`));

                    resolve(res.result);
                })
                .catch(err => {
                    return reject(new Error(`RPC eth_getBlockByNumber Error from geth: ${err}`));
                })
        } catch (error) {
            return reject(new Error(`getLatestBlock Error: ${error}`));
        }
    })
}
function getBalance(address) {
    return new Promise((resolve, reject) => {
        try {
            sendRPC('eth_getBalance', RpcConnectOption, [address, 'latest'])
                .then(resp => {
                    const res = JSON.parse(resp);
                    if (!res)
                        return reject(new Error(`RPC eth_getBalance Response body empty`));
                    if (res.error)
                        return reject(new Error(`RPC eth_getBalance Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                    if (!res.result)
                        return reject(new Error(`RPC eth_getBalance result empty`));

                    resolve(res.result);
                })
                .catch(err => {
                    return reject(new Error(`RPC eth_getBalance Error from geth: ${err}`));
                })
        } catch (error) {
            return reject(new Error(`getBalance Error: ${error}`));
        }
    })
}
function getTransactionCount(address) {
    return new Promise((resolve, reject) => {
        try {
            sendRPC('eth_getTransactionCount', RpcConnectOption, [address, 'latest'])
                .then(resp => {
                    const res = JSON.parse(resp);
                    if (!res)
                        return reject(new Error(`RPC eth_getTransactionCount Response body empty`));
                    if (res.error)
                        return reject(new Error(`RPC eth_getTransactionCount Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                    if (!res.result)
                        return reject(new Error(`RPC eth_getTransactionCount result empty`));
                    resolve(res.result);
                })
                .catch(err => {
                    return reject(new Error(`RPC eth_getTransactionCount return error: ${err}`));
                });
        } catch (error) {
            return reject(new Error(`getTransactionCount Error ${error}`));
        }
    })
}
function sendRawTransaction(rawTransaction) {
    return new Promise((resolve, reject) => {
        try {
            sendRPC('eth_sendRawTransaction', RpcConnectOption, [rawTransaction])
                .then(resp => {
                    const res = JSON.parse(resp);
                    if (!res)
                        return reject(new Error(`RPC eth_sendRawTransaction Response body empty`));
                    if (res.error)
                        return reject(new Error(`Code-114 RPC eth_sendRawTransaction Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                    if (!res.result)
                        return reject(new Error(`RPC eth_sendRawTransaction result empty`));

                    resolve(res.result);
                })
                .catch(err => {
                    return reject(new Error(`RPC eth_sendRawTransaction Error from geth: ${err}`));
                })
        } catch (error) {
            return reject(new Error(`sendRawTransaction Error from geth: ${error}`));
        }
    })
}
function getTransactionFromHash(tnHash) {
    return new Promise((resolve, reject) => {
        try {
            sendRPC('eth_getTransactionByHash', RpcConnectOption, [tnHash])
                .then(resp => {
                    const res = JSON.parse(resp);
                    if (!res)
                        return reject(new Error(`RPC eth_getTransactionByHash Response body empty`));
                    if (res.error)
                        return reject(new Error(`Code-114 RPC eth_getTransactionByHash Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                    if (!res.result)
                        return reject(new Error(`RPC eth_getTransactionByHash result empty`));

                    resolve(res.result);
                })
                .catch(err => {
                    return reject(new Error(`RPC eth_getTransactionByHash Error from geth: ${err}`));
                })
        } catch (error) {
            return reject(new Error(`getTransactionFromHash Error: ${error}`));
        }
    })
}
module.exports = {
    getBlockNumber: getBlockNumber,
    getBlockData: getBlockData,
    getTransactionFromETH: getTransactionFromETH,
    getTransactionCountETH: getTransactionCountETH,
    getGasPrice: getGasPrice,
    getLatestBlock: getLatestBlock,
    getBalance: getBalance,
    getTransactionCount: getTransactionCount,
    sendRawTransaction: sendRawTransaction,
    getTransactionFromHash: getTransactionFromHash
};
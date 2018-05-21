const RpcConnectOption = require(`${appRoot}/config/config.json`).ETHRpc;
const sendRPC = require(`${appRoot}/lib/utils`).sendRPC;
const utils = require(`${appRoot}/lib/ethereum/utilsETH`);
const rpcError = require(`${appRoot}/errors/RpcError`);

function getGasFromTransactionHash(hash) {
    return new Promise((resolve, reject) => {
        sendRPC('eth_getTransactionReceipt', RpcConnectOption, [hash])
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`getGasFromTransactionHash Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('getGasFromTransactionHash response body empty', 'eth', 200));
                if (!res.result.transactions)
                    return reject(new rpcError('getGasFromTransactionHash Transactions empty', 'eth', 201));
                if (!res.result.gasUsed)
                    return reject(new rpcError('getGasFromTransactionHash gasUsed from transaction empty', 'eth', 204));

                resolve(utils.convertHexToInt(res.result.gasUsed));
            })
            .catch(err => {
                throw new rpcError(`getGasFromTransactionHash Error from geth: ${err}`, 'eth', 202);
            })
    })
}
function getBlockData(numBlock) {
    return new Promise((resolve, reject) => {
        sendRPC('eth_getBlockByNumber', RpcConnectOption, [utils.convertNumberToHex(numBlock), true])
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`getBlockData Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('getBlockData response body empty', 'eth', 200));
                if (!res.result.transactions)
                    return reject(new rpcError('getBlockData Transactions empty', 'eth', 201));
                resolve(res.result);
            })
            .catch(err => {
                return reject(new rpcError(`getBlockData Error from geth: ${err}`, 'eth', 202));
            })
    })
}
async function getTransactionCountETH(numBlock) {
    const blockData = await getBlockData(numBlock);
    return blockData.transactions.length;
}
function getBlockNumber(param) {
    return new Promise((resolve, reject) => {
        if (!param || (param !== 'pending'))
            param = 'latest';
        sendRPC('eth_getBlockByNumber', RpcConnectOption, [param, true])
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`getBlockNumber Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('getBlockNumber response body empty', 'eth', 200));
                if (!res.result.number)
                    return reject(new rpcError('getBlockNumber Transactions empty', 'eth', 201));

                resolve(parseInt(utils.convertHexToInt(res.result.number)));
            })
            .catch(err => {
                return reject(new rpcError(`getBlockNumber Error from geth: ${err}`, 'eth', 202));
            })
    })
}
function getGasPrice() {
    return new Promise((resolve, reject) => {
        sendRPC('eth_gasPrice', RpcConnectOption)
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`getGasPrice Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('getGasPrice response body empty', 'eth', 200));

                resolve(res.result);
            })
            .catch(err => {
                return reject(new rpcError(`getGasPrice Error from geth: ${err}`, 'eth', 202));
            })
    })
}
function getLatestBlock() {
    return new Promise((resolve, reject) => {
        sendRPC('eth_getBlockByNumber', RpcConnectOption, ['latest', true])
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`getLatestBlock Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('getLatestBlock response body empty', 'eth', 200));

                resolve(res.result);
            })
            .catch(err => {
                return reject(new rpcError(`getLatestBlock Error from geth: ${err}`, 'eth', 202));
            })
    })
}
function getBalance(address) {
    return new Promise((resolve, reject) => {
        sendRPC('eth_getBalance', RpcConnectOption, [address, 'latest'])
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`getBalance Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('getBalance response body empty', 'eth', 200));

                resolve(res.result);
            })
            .catch(err => {
                return reject(new rpcError(`getBalance Error from geth: ${err}`, 'eth', 202));
            })
    })
}
function getTransactionCount(address) {
    return new Promise((resolve, reject) => {
        sendRPC('eth_getTransactionCount', RpcConnectOption, [address, 'latest'])
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`getTransactionCount Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('getTransactionCount response body empty', 'eth', 200));

                resolve(res.result);
            })
            .catch(err => {
                return reject(new rpcError(`getTransactionCount Error from geth: ${err}`, 'eth', 202));
            });
    })
}
function sendRawTransaction(rawTransaction) {
    return new Promise((resolve, reject) => {
        sendRPC('eth_sendRawTransaction', RpcConnectOption, [rawTransaction])
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`sendRawTransaction Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('sendRawTransaction response body empty', 'eth', 200));

                resolve(res.result);
            })
            .catch(err => {
                return reject(new rpcError(`sendRawTransaction Error from geth: ${err}`, 'eth', 202));
            })
    })
}
function getTransactionFromHash(tnHash) {
    return new Promise((resolve, reject) => {
        sendRPC('eth_getTransactionByHash', RpcConnectOption, [tnHash])
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`getTransactionFromHash Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('getTransactionFromHash response body empty', 'eth', 200));

                resolve(res.result);
            })
            .catch(err => {
                return reject(new rpcError(`getTransactionFromHash Error from geth: ${err}`, 'eth', 202));
            })
    })
}
async function getTokenBalance(contractAddress, address) {
    try {
        const decimals = await getContractDecimals(contractAddress);
        const tokens = await getTokens(contractAddress, address);
        return tokens.dividedBy(10 ** decimals.toNumber());
    } catch (error) {
        return new Error('getTokenBalance Error: ' + error);
    }
}
function getTokens(contractAddress, address) {
    return new Promise((resolve, reject) => {
        try {
            const data = '0x'
            + utils.sha3('balanceOf(address)').slice(0, 8)
            + utils.padLeft(utils.
                toTwosComplement(address).toString(16), 64);
            sendRPC('eth_call', RpcConnectOption, [
                {
                    value: '0x0',
                    to: contractAddress,
                    data: data
                },
                'latest'
            ])
                .then(resp => {
                    const res = utils.isJson(resp) ? JSON.parse(resp) : null;
                    if(!res)
                        return reject(new Error('RPC eth_call contract ' + contractAddress +
                            'balanceOf('+ address +') return bad response.'));
                    if(res.error)
                        return reject(new Error('Error Code-114.'
                        + res.error.message));
                    if(!res.result|| !utils.isString(res.result))
                        return reject(new Error('RPC eth_call contract ' + contractAddress +
                            'balanceOf('+ address +') return bad result.'));
                    const tokens = utils.toBigNumber(res.result);
                    return resolve(tokens);
                })
                .catch(err => {
                    return reject(new Error('RPC eth_call contract ' + contractAddress +
                        ' Error:' + err));
                })
        } catch (error) {
            return reject(new Error('getTokenBalance Error:' + error));
        }
    })
}
function getContractDecimals(contractAddress) {
    return new Promise((resolve, reject) => {
        try {
            const data = '0x'
                + utils.sha3('decimals()').slice(0, 8);
            sendRPC('eth_call', RpcConnectOption, [
                {
                    value: '0x0',
                    to: contractAddress,
                    data: data
                },
                'latest'
            ])
                .then(resp => {
                    const res = utils.isJson(resp) ? JSON.parse(resp) : null;
                    if(!res) return reject('RPC eth_call' + contractAddress +
                        ' decimals() return bad response');
                    if(res.error) return reject('RPC eth_call' + contractAddress +
                        ' decimals() Error: ' + res.error);
                    if(!res.result) return reject('RPC eth_call' + contractAddress +
                        ' decimals() return bad result');
                    const decimals = utils.toBigNumber(res.result);
                    return resolve(decimals);
                })
                .catch(err => {
                    return reject(err);
                });
        } catch (error) {
            return reject(error);
        }
    })
}
module.exports = {
    getBlockNumber: getBlockNumber,
    getBlockData: getBlockData,
    getTransactionCountETH: getTransactionCountETH,
    getGasPrice: getGasPrice,
    getLatestBlock: getLatestBlock,
    getBalance: getBalance,
    getTransactionCount: getTransactionCount,
    sendRawTransaction: sendRawTransaction,
    getTransactionFromHash: getTransactionFromHash,
    getGasFromTransactionHash: getGasFromTransactionHash,
    getTokenBalance: getTokenBalance
};
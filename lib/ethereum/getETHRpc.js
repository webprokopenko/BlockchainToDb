const RpcConnectOption = require(`../../config/config.json`).ETHRpc;
const sendRPC = require(`../../lib/utils`).sendRPC;
const utils = require(`../../lib/ethereum/utilsETH`);
const rpcError = require(`../../errors/RpcError`);

function getGasFromTransactionHash(hash) {
    return new Promise((resolve, reject) => {
        sendRPC('eth_getTransactionReceipt', RpcConnectOption, [hash])
            .then(resp => {
                const res = JSON.parse(resp);
                if (res.error)
                    return reject(new rpcError(`getGasFromTransactionHash Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError('getGasFromTransactionHash response body empty', 'eth', 200));
                if (!res.result.gasUsed)
                    return reject(new rpcError('getGasFromTransactionHash gasUsed from transaction empty', 'eth', 204));

                resolve({
                    gasUsed:utils.convertHexToInt(res.result.gasUsed),
                    status: utils.convertHexToInt(res.result.status)
                });
            })
            .catch(err => {
                return reject(new rpcError(`getGasFromTransactionHash Error from geth: ${err}`, 'eth', 202));
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
                res.result.transactions.forEach(tx => {
                    tx.input = _isContractTransfer(tx)
                        || _isContractTransferFrom(tx) || {};
                });
                resolve(res.result);
            })
            .catch(err => {
                return reject(new rpcError(`getBlockData Error from geth: ${err}`, 'eth', 202));
            })
    })
}
function _isContractTransfer(tx) {
    try {
        if(tx.input
            && utils.isString(tx.input)
            && tx.input.substr(2,8) === 'a9059cbb') {
            const data = {};
            data.to = '0x' + tx.input.substr(10,64).replace(/^0+/,'');
            data.value = utils
                .toBigNumber('0x' + tx.input.substr(74,64)).toString();
            return data;
        }
        return false;
    } catch (error) {
        return false;
    }
}
function _isContractTransferFrom(tx) {
    try {
        if(tx.input
            && utils.isString(tx.input)
            && tx.input.substr(2,8) === '23b872dd') {
            const data = {};
            data.from = '0x' + tx.input.substr(10,64).replace(/^0+/,'');
            data.to = '0x' + tx.input.substr(74,64).replace(/^0+/,'');
            data.value = utils
                .toBigNumber('0x' + tx.input.substr(138,64)).toString();
            return data;
        }
        return false;
    } catch (error) {
        return false;
    }
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
function getTokens(contractAddress, address) {
    return new Promise((resolve, reject) => {
        const data = '0x'
            + utils.sha3('balanceOf(address)').slice(0, 8)//"transfer(address, uint32)"
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
                if (res.error)
                    return reject(new rpcError(`getTokens Error from command geth  Message: ${res.error.message}`,
                        'eth', res.error.code));

                if (!res || !res.result)
                    return reject(new rpcError('getTokens response body empty contract ' + contractAddress +
                        'balanceOf(' + address + ')', 'eth', 200));

                const tokens = utils.toBigNumber(res.result);
                return resolve(tokens);
            })
            .catch(err => {
                return reject(new rpcError(`getTokens contract ${contractAddress}  Error from geth: ${err}`, 'eth', 202));

            })
    })
}
function getContractDecimals(contractAddress) {
    return new Promise((resolve, reject) => {
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
                if (res.error)
                    return reject(new rpcError(`getContractDecimals Error from command geth  Message: ${res.error.message}`,
                        'eth', res.error.code));
                if (!res || !res.result)
                    return reject(new rpcError(`getContractDecimals response body empty contract ${contractAddress}`, 'eth', 200));
                try {
                    const decimals = utils.toBigNumber(res.result);
                    return resolve(decimals);
                } catch (error) {
                    return reject(new rpcError(`Wrong data by contract ${contractAddress}`, 'eth', 208));
                }
            })
            .catch(err => {
                return reject(new rpcError(`getContractDecimals contract ${contractAddress}  Error from geth: ${err}`, 'eth', 202));
            });
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
    getTokens: getTokens,
    getContractDecimals: getContractDecimals
};
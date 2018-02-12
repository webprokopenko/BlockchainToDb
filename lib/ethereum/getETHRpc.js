const rpc = require('node-json-rpc');
const Units = require('ethereumjs-units');
const math = require('mathjs');
const RpcConnectOption = require('../../config/config.json').ETHRpc
const clientRPC = new rpc.Client(RpcConnectOption);

function convertNumberToHex(num) {
    return `0x${num.toString(16)}`
}
function convertHexToInt(hex) {
    return `${parseInt(hex, 16)}`
}
function getGasFromTransactionHash(hash) {
    return new Promise((resolve, reject) => {
        clientRPC.call(
            {
                'jsonrpc': '2.0',
                'method': 'eth_getTransactionReceipt',
                'params': [hash],
                'id': 1
            },
            (err, res) => {
                if (err)
                    return reject(err)
                if (!res)
                    return reject(new Error(`Response body empty`));
                if (res.error)
                    return reject(new Error(`Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if (!res.result)
                    return reject(new Error(`Result body empty`))
                if (!res.result.gasUsed)
                    return reject(new Error('Result gasUsed from transaction empty'))

                resolve(convertHexToInt(res.result.gasUsed));
            }
        )
    })
}
function getBlockData(numBlock) {
    return new Promise((resolve, reject) => {
        clientRPC.call(
            {
                'jsonrpc': '2.0',
                'method': 'eth_getBlockByNumber',
                'params': [convertNumberToHex(numBlock), true],
                'id': 1
            },
            (err, res) => {
                if (err)
                    return reject(new Error(`Error from geth: ${err}`));
                if (!res)
                    return reject(new Error(`Response body empty`));
                if (res.error)
                    return reject(new Error(`Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if (!res.result.transactions)
                    return reject(new Error(`Transactions empty`))

                resolve(res.result);
            }
        )
    })
}
async function getTransactionFromETH(numBlock) {
    try {
        const blockData = await getBlockData(numBlock);
        let blockTransaction = [];
        await Promise.all(blockData.transactions.map(async (element) => {
            let transaction = {};
            transaction.from = element.from;
            transaction.to = element.to;
            //block ethereum 1100009 bad value
            element.gas = math.bignumber(convertHexToInt(element.gas)).toFixed();
            element.gasPrice = math.bignumber(convertHexToInt(element.gasPrice)).toFixed()
            transaction.value = Units.convert(math.bignumber(convertHexToInt(element.value)).toFixed(), 'wei', 'eth'); //unexpect 0x26748d96b29f5076000 value not support
            transaction.fee = Units.convert(element.gas * element.gasPrice, 'wei', 'eth');
            transaction.hash = element.hash;
            let gasUse = math.bignumber(await getGasFromTransactionHash(element.hash));
            let gasPrice = math.bignumber(Units.convert(element.gasPrice, 'wei', 'eth'));
            transaction.fee = math.multiply(gasPrice, gasUse).toFixed();
            transaction.timestamp = convertHexToInt(blockData.timestamp);
            transaction.blockNum = convertHexToInt(element.blockNumber);
            blockTransaction.push(transaction);
        }));
        return blockTransaction.length > 0 ? blockTransaction : null;

    } catch (e) {
        console.error('Error getTransactionFromETH ' + e + 'BlockNum: ' + numBlock);
    }
}
async function getTransactionCountETH(numBlock) {
    try {
        const blockData = await getBlockData(numBlock);
        return blockData.transactions.length;
    } catch (error) {
        console.error('Error getTransactionCountETH ' + error + 'BlockNum: ' + numBlock);
    }
}

function getBlockNumber(param) {
    return new Promise((resolve, reject) => {
        if (!param || (param !== 'latest' && param != 'pending'))
            return reject(new Error(`function getBlockNumber missin param`));
        clientRPC.call(
            {
                'jsonrpc': '2.0',
                'method': 'eth_getBlockByNumber',
                'params': [param, true],
                'id': 1
            },
            (err, res) => {
                if (err)
                    return reject(new Error(`getBlockNumber Error from geth: ${err}`));
                if (!res)
                    return reject(new Error(`getBlockNumber Response body empty`));
                if (res.error)
                    return reject(new Error(`getBlockNumber Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if (!res.result.number)
                    return reject(new Error(`getBlockNumber Block number empty`))

                resolve(parseInt(convertHexToInt(res.result.number)));
            }
        )
    })
}
function getGasPrice() {
    return new Promise((resolve, reject) => {
        clientRPC.call(
            {
                'jsonrpc': '2.0',
                'method': 'eth_gasPrice',
                'params': [],
                'id': 7
            },
            (err, res) => {
                if (err)
                    return reject(new Error(`getBlockNumber Error from geth: ${err}`));
                if (!res)
                    return reject(new Error(`getBlockNumber Response body empty`));
                if (res.error)
                    return reject(new Error(`getBlockNumber Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if (!res.result)
                    return reject(new Error(`getGasPrice result empty`))

                resolve(res.result);
            }
        )
    })
}
function getLatestBlock(){
    return new Promise((resolve, reject) => {
        clientRPC.call(
            {
                'jsonrpc': '2.0',
                'method': 'eth_getBlockByNumber',
                'params': ['latest',true],
                'id': 1
            },
            (err, res) => {
                if (err)
                    return reject(new Error(`getLatestBlock Error from geth: ${err}`));
                if (!res)
                    return reject(new Error(`getLatestBlock Response body empty`));
                if (res.error)
                    return reject(new Error(`getLatestBlock Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if (!res.result)
                    return reject(new Error(`getLatestBlock result empty`))

                resolve(res.result);
            }
        )
    })
}
function getBalance(address){
    return new Promise((resolve, reject) => {
        clientRPC.call(
            {
                'jsonrpc': '2.0',
                'method': 'eth_getBalance',
                'params': [address, 'latest'],
                'id': 1
            },
            (err, res) => {
                if (err)
                    return reject(new Error(`getBalance Error from geth: ${err}`));
                if (!res)
                    return reject(new Error(`getBalance Response body empty`));
                if (res.error)
                    return reject(new Error(`getBalance Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if (!res.result)
                    return reject(new Error(`getBalance result empty`))

                resolve(res.result);
            }
        )
    })
}
function getTransactionCount(address){
    return new Promise((resolve, reject) => {
        clientRPC.call(
            {
                'jsonrpc': '2.0',
                'method': 'eth_getTransactionCount',
                'params': [address, 'latest'],
                'id': 1
            },
            (err, res) => {
                if (err)
                    return reject(new Error(`getTransactionCount Error from geth: ${err}`));
                if (!res)
                    return reject(new Error(`getTransactionCount Response body empty`));
                if (res.error)
                    return reject(new Error(`getTransactionCount Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if (!res.result)
                    return reject(new Error(`getTransactionCount result empty`))

                resolve(res.result);
            }
        )
    })
}
module.exports = {
    getBlockNumber:         getBlockNumber,
    getBlockData:           getBlockData,
    getTransactionFromETH:  getTransactionFromETH,
    getTransactionCountETH: getTransactionCountETH,
    getGasPrice:            getGasPrice,
    getLatestBlock:         getLatestBlock,
    getBalance:             getBalance,
    getTransactionCount:    getTransactionCount
}
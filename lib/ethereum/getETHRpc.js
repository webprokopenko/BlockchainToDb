const rpc = require('node-json-rpc');
const util = require('util');
const Units = require('ethereumjs-units');
const math = require('mathjs');
const RpcConnectOption = require('../../config/config.json').ETHRpc
clientRPC = new rpc.Client(RpcConnectOption);

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
        let blockTransaction=[];
        await Promise.all(blockData.transactions.map(async (element, i) => {
            let transaction = {};
            transaction.from = element.from;
            transaction.to = element.to;
            //block ethereum 1100009 bad value
            element.gas = math.bignumber(convertHexToInt(element.gas)).toFixed();
            element.gasPrice = math.bignumber(convertHexToInt(element.gasPrice)).toFixed()
            transaction.value = Units.convert(math.bignumber(convertHexToInt(element.value)).toFixed(), 'wei', 'eth'); //unexpect 0x26748d96b29f5076000 value not support
            transaction.fee = Units.convert(element.gas * element.gasPrice, 'wei', 'eth');
            transaction.hash = element.hash;
            gasUse = math.bignumber(await getGasFromTransactionHash(element.hash));
            gasPrice = math.bignumber(Units.convert(element.gasPrice, 'wei', 'eth'));
            transaction.fee = math.multiply(gasPrice, gasUse).toFixed();
            transaction.timestamp = convertHexToInt(blockData.timestamp);
            transaction.blockNum = convertHexToInt(element.blockNumber);
            blockTransaction.push(transaction);
        }));
        return blockTransaction.length>0 ? blockTransaction : null;

    } catch (e) {
        console.log('Error getTransactionFromETH '+ e + 'BlockNum: ' + numBlock);
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
module.exports = {
    getBlockNumber:         getBlockNumber,
    getBlockData:           getBlockData,
    getTransactionFromETH:  getTransactionFromETH
}
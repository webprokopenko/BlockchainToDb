const testData = require(appRoot + '/test/SERVICES/ETH/geth_config.json');
const utils = require(appRoot + '/lib/ethereum/utilsETH');

module.exports = {
    eth_getBalance: (params) => {
        if(!utils.isArray(params) || !utils.isAddress(params[0]) || !params[1])
        {
            throw Error('Wrong input params');
        } else {
            const str = ['latest', 'earliest', 'pending'];
            if(str.indexOf(params[1]) >= 0) {
                return testData.balance;
            } else throw Error('Invalid argument 1');
        }
    },
    eth_getBlockByNumber: (params) => {
        if(!utils.isArray(params) || !params[0])
        {
            throw Error('Wrong input params');
        } else return testData.block;
    },
    eth_gasPrice: () => {
        return testData.gasPrice;
    },
    eth_getTransactionReceipt: (params) => {
        if(!utils.isArray(params) || !utils.isAddress(params[0]))
        {
            throw Error('Wrong input params');
        } else return testData.transactionReceipt;
    },
    eth_getTransactionCount: () => {
        return testData.transactionCount;
    },
    eth_sendRawTransaction: () => {
        return testData.hash;
    },
    eth_getTransactionByHash: (params) => {
        if(!utils.isArray(params) || !params[0])
        {
            throw Error('Wrong input params');
        } else return testData.transaction;
    },
    eth_call: (params) => {
        if(!utils.isArray(params) || !params[0])
        {
            throw Error('Wrong input params');
        } else {
            if(!utils.isAddress(params[0].to)) {
                throw Error('Wrong input params');
            } else {
                return testData.tokens;
            }
        }
    }
};
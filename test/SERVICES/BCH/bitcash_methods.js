const testData = require(appRoot + '/test/SERVICES/BCH/bitcash_config.json');
const utils = require(appRoot + '/lib/bitcoin/utilsBTC');

module.exports = {
    sendrawtransaction: (params) => {
        if(!utils.isArray(params) || !utils.isString(params[0]))
        {
            throw Error('Wrong input params');
        } else return testData.txId;
    },
    getblockcount: () => {
        return testData.blockCount;
    },
    getblock: (params) => {
        if(!utils.isArray(params) || !utils.isString(params[0]) ||  !utils.isBoolean(params[1]))
        {
            throw Error('Wrong input params');
        } else return testData.block;
    },
    getblockhash: (params) => {
        if(!utils.isArray(params) || !Number.isInteger(params[0]))
        {
            throw Error('Wrong input params');
        } else return testData.blockHash;
    },
    getrawtransaction: (params) => {
        if(!utils.isArray(params) || !utils.isString(params[0]) ||  !utils.isBoolean(params[1]))
        {
            throw Error('Wrong input params');
        } else return testData.rawTransaction;
    }
};
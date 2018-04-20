if(!global.appRoot) {
    const path = require('path');
    global.appRoot = path.resolve(__dirname);
    global.appRoot = global.appRoot.replace('/exec','');
}
const Queue = require(`${appRoot}/lib/TaskQueue`);
const mongodbConnectionString = require(`${appRoot}/config/config.json`).mongodbConnectionString;
//Intel logger setup
const intel = require('intel');
const LoggerTransactionToDbScanBlock = intel.getLogger('transactionsToDbScan');
const LoggerTransactionToDbError = intel.getLogger('transactionsToDbError');
const LoggerTransactionToDbBadBlock = intel.getLogger('transactionsToDbBadBlock');
LoggerTransactionToDbScanBlock.setLevel(LoggerTransactionToDbScanBlock.INFO)
    .addHandler(new intel.handlers.File(`${appRoot}/logs/transactionsToDb/scanblock.log`));
LoggerTransactionToDbBadBlock.setLevel(LoggerTransactionToDbBadBlock.INFO)
    .addHandler(new intel.handlers.File(`${appRoot}/logs/transactionsToDb/badblock.log`));
LoggerTransactionToDbError.setLevel(LoggerTransactionToDbError.ERROR)
    .addHandler(new intel.handlers.File(`${appRoot}/logs/transactionsToDb/error.log`));
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
let getRpc = null;
let dbTransactionLib = null;
function _init(currency) {
    const curr = {
        'BTC': {
            rpc: `${appRoot}/lib/bitcoin/getBTCbitcoin`,
            dbLib: `${appRoot}/lib/mongodb/btctransactions`
        },
        'BCH': {
            rpc: `${appRoot}/lib/bitcoin_cash/getBCHbitcoin_cash`,
            dbLib: `${appRoot}/lib/mongodb/bchtransactions`
        },
        'BTG': {
            rpc: `${appRoot}/lib/bitcoin_gold/getBTGbitcoin_gold`,
            dbLib: `${appRoot}/lib/mongodb/btgtransactions`
        },
        'LTC': {
            rpc: `${appRoot}/lib/litecoin/getLTClitecoin`,
            dbLib: `${appRoot}/lib/mongodb/ltctransactions`
        },
        'ZEC': {
            rpc: `${appRoot}/lib/zcash/getZECzcash`,
            dbLib: `${appRoot}/lib/mongodb/zectransactions`
        }
    };
    if(!curr[currency]) {
        getRpc = require(`${appRoot}/lib/bitcoin/getBTCbitcoin`);
        dbTransactionLib = require(`${appRoot}/lib/mongodb/btctransactions`);
    } else {
        getRpc = require(curr[currency].rpc);
        dbTransactionLib = require(curr[currency].dbLib);
    }
}
async function saveBlockTransactionFromTo(from, to, order, currency) {
    if(!getRpc || !dbTransactionLib) _init(currency);
    const taskQue = new Queue(order);
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done => {
            try {
                let blockData = await getRpc.getTransactionsFromBlock(i);
                if (blockData) {
                    await Promise.all(blockData.map(async (element) => {
                        await dbTransactionLib.saveTransactionToMongoDb(element)
                    }));
                }
                console.log(`BlockNum: ${i} ${currency}`);
                done();
            } catch (error) {
                if(parseInt(error.code) !== 11000){
                    LoggerTransactionToDbBadBlock.error(i);
                    LoggerTransactionToDbError.error(`Bad block ${i} currency: ${currency} Error: saveBlockTransactionFromTo: ${error}`);
                }
                done();
            }
        })
    }
}
async function scanTxsToMongo(currency) {
    try {
        _init(currency);
        const lastBlockN = await dbTransactionLib.getLastBlock();
        const highestBlockN = await getRpc.getBlockCount();
        if(highestBlockN > lastBlockN)
            saveBlockTransactionFromTo(lastBlockN + 1, highestBlockN, 10, currency)
                .then(() => {
                    console.log('Scanning complete at ' + Date());
                })
                .catch(err => {
                    LoggerTransactionToDbError.error(`Scannning error: ${error}`);
                });
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    scanTxsToMongo:             scanTxsToMongo,
    saveBlockTransactionFromTo: saveBlockTransactionFromTo
};
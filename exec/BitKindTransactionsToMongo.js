const Quequ = require('../lib/TaskQueue');
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
//Intel logger setup
const intel = require('intel');
const LoggerTransactionToDbScanBlock = intel.getLogger('transactionsToDbScan');
const LoggerTransactionToDbError = intel.getLogger('transactionsToDbError');
const LoggerTransactionToDbBadBlock = intel.getLogger('transactionsToDbBadBlock');
LoggerTransactionToDbScanBlock.setLevel(LoggerTransactionToDbScanBlock.INFO).addHandler(new intel.handlers.File('./logs/transactionsToDb/scanblock.log'));
LoggerTransactionToDbBadBlock.setLevel(LoggerTransactionToDbBadBlock.INFO).addHandler(new intel.handlers.File('./logs/transactionsToDb/badblock.log'));
LoggerTransactionToDbError.setLevel(LoggerTransactionToDbError.ERROR).addHandler(new intel.handlers.File('./logs/transactionsToDb/error.log'));
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
let getRpc = null;
let dbTransactionLib = null;
function _init(currency) {
    const curr = {
        'BTC': {
            rpc: '../lib/bitcoin/getBTCbitcoin',
            dbLib: '../lib/mongodb/btctransactions'
        },
        'BCH': {
            rpc: '../lib/bitcoin_cash/getBCHbitcoin_cash',
            dbLib: '../lib/mongodb/bchtransactions'
        },
        'BTG': {
            rpc: '../lib/bitcoin_gold/getBTGbitcoin_gold',
            dbLib: '../lib/mongodb/btgtransactions'
        },
        'LTC': {
            rpc: '../lib/litecoin/getLTClitecoin',
            dbLib: '../lib/mongodb/ltctransactions'
        }
    };
    if(!curr[currency]) {
        getRpc = require('../lib/bitcoin/getBTCbitcoin');
        dbTransactionLib = require('../lib/mongodb/btctransactions');
    } else {
        getRpc = require(curr[currency].rpc);
        dbTransactionLib = require(curr[currency].dbLib);
    }
}
async function saveBlockTransactionFromTo(from, to, order, currency) {
    if(!getRpc || !dbTransactionLib) _init(currency);
    const taskQue = new Quequ(order);
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
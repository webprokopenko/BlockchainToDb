const getRpc = require('../lib/litecoin/getLTCbitcoin');
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
const dbLTCtransactionsLib = require('../lib/mongodb/ltctransactions');

async function saveBlockTransactionFromTo(from, to, order) {
    const taskQue = new Quequ(order);
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done => {
            try {
                let blockData = await getRpc.getTransactionsFromBTC(i);
                if (blockData) {
                    await Promise.all(blockData.map(async (element) => {
                        await dbBTCtransactionsLib.saveBTCTransactionsToMongoDb(element)
                    }));
                }
                console.log(`BlockNum: ${i}`);
                done();
            } catch (error) {
                if(parseInt(error.code) !== 11000){
                    LoggerTransactionToDbBadBlock.error(i);
                    LoggerTransactionToDbError.error(`Bad block ${i} Error: saveBlockTransactionFromTo: ${error}`);
                }
                done();
            }
        })
    }
}
async function scanTxsToMongo() {
    const lastBlockN = await dbLTCtransactionsLib.getLastBlock();
    const highestBlockN = await getRpc.getBlockCount();
    if(highestBlockN > lastBlockN)
        saveBlockTransactionFromTo(lastBlockN + 1, highestBlockN, 10)
            .then(() => {
                console.log('Scanning complete at ' + Date());
            })
            .catch(err => {
                LoggerTransactionToDbError.error(`Scannning error: ${error}`);
            });
}

module.exports = scanTxsToMongo;
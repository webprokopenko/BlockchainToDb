const getRpc = require('../lib/litecoin/getLTClitecoin');
const Quequ = require('../lib/TaskQueue');
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
//Intel logger setup
const intel = require('intel');
const LoggerTransactionToDbError = intel.getLogger('transactionsToDbError');
const LoggerTransactionToDbBadBlock = intel.getLogger('transactionsToDbBadBlock');
LoggerTransactionToDbBadBlock.setLevel(LoggerTransactionToDbBadBlock.INFO).addHandler(new intel.handlers.File('./logs/transactionsToDb/badblock.log'));
LoggerTransactionToDbError.setLevel(LoggerTransactionToDbError.ERROR).addHandler(new intel.handlers.File('./logs/transactionsToDb/eror.log'));
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
//dbEthertransactionsLib
const dbLTCtransactionsLib = require('../lib/mongodb/ltctransactions');


//Arguments listener
//const argv = require('minimist')(process.argv.slice(2));
async function saveBlockTransactionFromTo(from, to, order) {
    const taskQue = new Quequ(order);
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done => {
            try {
                let blockData = await getRpc.getTransactionsFromLTC(i);
                if (blockData) {
                    await Promise.all(blockData.map(async (element) => {
                        await dbLTCtransactionsLib.saveLTCTransactionsToMongoDb(element)
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
async function saveTxsToMongo() {
    const lastBlockN = await dbLTCtransactionsLib.getLastBlock();
    const highestBlockN = await getRpc.getBlockCount();
    if(highestBlockN > lastBlockN)
        saveBlockTransactionFromTo(lastBlockN + 1, highestBlockN, 10);
}
//saveBlockTransactionFromTo(1291441, 1292104, 10);
module.exports = {
    saveTxsToMongo:  saveTxsToMongo
};
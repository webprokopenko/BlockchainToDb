require('../models/BitcoinTransactionModel');
const getRpc = require('../lib/bitcoin/getBTCbitcoin');
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
const dbBTCtransactionsLib = require('../lib/mongodb/btctransactions');


//Arguments listener
//const argv = require('minimist')(process.argv.slice(2));
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
saveBlockTransactionFromTo(1291441, 1292104, 10);
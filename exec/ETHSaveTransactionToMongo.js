
require('../models/BlockTransactionModel.js');
const getETHRpc = require('../lib/ethereum/getETHRpc');
const Quequ = require('../lib/TaskQueue');
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;

//Intel logger setup
const intel = require('intel');
const LoggerTransactionToDbError = intel.getLogger('transactionsToDbError');
const LoggerTransactionToDbBadBlock = intel.getLogger('transactionsToDbBadBlock');
LoggerTransactionToDbBadBlock.setLevel(LoggerTransactionToDbBadBlock.INFO).addHandler(new intel.handlers.File('../logs/transactionsToDb/badblock.log'));
LoggerTransactionToDbError.setLevel(LoggerTransactionToDbError.ERROR).addHandler(new intel.handlers.File('../logs/transactionsToDb/eror.log'));
//Mongoose
const mongoose = require('mongoose');
const BlockTransaction = mongoose.model('blockTransaction');
mongoose.connect(mongodbConnectionString);

//Arguments listener
const argv = require('minimist')(process.argv.slice(2));

const fs = require('fs');
const path = require('path');

function saveBlockTransactionToMongoDb(blockData) {
    return new Promise((resolve, reject) => {
        try {
            blockData = new BlockTransaction(blockData);
            blockData.save()
                .then(item => {
                    resolve(true);
                })
                .catch(e => {
                    reject(e);
                });
        } catch (error) {
            reject(error)
        }
    })
}
function getLastBlockTransactionMongoDb() {
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .findOne({})
                .sort({ block: -1 })
                .then(res => {
                    res.block ? resolve(res.block) : reject(new Error(`function getLastBlockTransactionMongoDb no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    });
}
function getFirstBlockTransactionMongoDb() {
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .findOne({})
                .then(res => {
                    res.block ? resolve(res.block) : reject(new Error(`function getFirstBlockTransactionMongoDb no block number`));
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    });
}
async function existBlock(numBlock){
    return new Promise((resolve, reject) => {
        try {
            BlockTransaction
                .findOne({block:numBlock})
                .then(res => {
                    res ? resolve(true) : resolve(false);
                })
                .catch(e => reject(e));
        } catch (error) {
            reject(error);
        }
    });
}
async function saveBlockTransactionLastinMongoDb(order) {
    if (!order) return LoggerTransactionToDbError.error('function saveBlockTransactionLastinMongoDb order is empty');
    try {
        let lastBlockInMongoDb = await getLastBlockTransactionMongoDb();
        let lastBlockInEthereum = await getETHRpc.getBlockNumber('latest');
        saveBlockTransactionFromTo(lastBlockInMongoDb + 1, lastBlockInEthereum, order);
    } catch (error) {
        LoggerTransactionToDbError.error('function saveBlockTransactionLastinMongoDb ' + error);
    }

}
async function saveBlockTransactionFromTo(from, to, order) {
    const taskQue = new Quequ(order);
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done => {
            try {
                blockData = await getETHRpc.getTransactionFromETH(i);
                await saveBlockTransactionToMongoDb(blockData);
                console.log(` Write OK! ${i}`);
                done();
            } catch (error) {
                LoggerTransactionToDbBadBlock.error(i);
                LoggerTransactionToDbError.error(error);
                done();
            }
        })
    }
}
async function scanBadBlockfromMongoDbAndSave(){
    const taskQue = new Quequ(5);
    try {
        let from    = await getFirstBlockTransactionMongoDb();
        let to      = await getLastBlockTransactionMongoDb();
        for (let i = from; i <= to; i++) {
            let exists =  await existBlock(i);
            if(!exists){
                taskQue.pushTask(async done => {
                    try {
                        blockData = await getETHRpc.getTransactionFromETH(i);
                        await saveBlockTransactionToMongoDb(blockData);
                        console.log(` Write OK! ${i}`);
                        done();
                    } catch (error) {
                        LoggerTransactionToDbBadBlock.error(i);
                        LoggerTransactionToDbError.error(error);
                        done();
                    }
                })
            }else{
                console.log(` Block exist ${i}`)
            }
        }
    } catch (error) {
        console.log('Error ' + error);
    }
}
function scanBadBlock(filename, callback) {
    fs.readFile(path.normalize(filename), 'utf8', (err, data) => {
        if (err)
            return callback(err, null)
        let tmp = data.split('\n');
        return callback(null, tmp)
    });
}
function saveBadBlock() {
    scanBadBlock('../logs/transactionsToDb/badblock.log', (err, data) => {
        if (err) console.log('Error scan block' + err);
        const taskQue = new Quequ(10);
        data.forEach(element => {
            taskQue.pushTask(async done => {
                try {
                    blockData = await getETHRpc.getTransactionFromETH(element);
                    await saveBlockTransactionToMongoDb(blockData);
                    console.log(` Write OK! ${element}`);
                    done();
                } catch (error) {
                    LoggerTransactionToDbBadBlock.error(element);
                    LoggerTransactionToDbError.error(error);
                    done();
                }
            })
        });
    });
}
if (argv) {
    if (argv.from && argv.to && argv.order) {
        saveBlockTransactionFromTo(argv.from, argv.to, argv.order);
    }
    if (argv.latest && argv.order) {
        saveBlockTransactionLastinMongoDb(argv.order);
    }
    if (argv.getlastblock) {
        getETHRpc.getBlockNumber('latest').then(block => {
            console.log(block);
        })
    }
    if (argv.getblock && argv.getblock > 0) {
        getETHRpc.getBlockData(argv.getblock).then(block => {
            console.log(block);
        })
    }
    if (argv.savebadblock){
        scanBadBlockfromMongoDbAndSave();
    }
}




require('../models/EthereumTransactionModel.js');
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
const BlockTransaction = mongoose.model('ethtransactions');
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
async function saveBlockTransactionFromTo(from, to, order) {
    const taskQue = new Quequ(order);
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done => {
            try {
                blockData = await getETHRpc.getTransactionFromETH(i);
                if (blockData) {
                    await Promise.all(blockData.map(async (element, i) => {
                        await saveBlockTransactionToMongoDb(element)
                    }));
                }
                //console.log(` Write OK! ${i}`);
                done();
            } catch (error) {
                //LoggerTransactionToDbBadBlock.error(i);
                //LoggerTransactionToDbError.error(error);
                console.error(`Bad block ${i}`);
                done();
            }
        })
    }
}
async function calculateCountTransactionFromTo(from, to, callback){
    const taskQue = new Quequ(10);
    let count = 0;
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done => {
            try {
                trnCountinBlock = await getETHRpc.getTransactionCountETH(i);
                count = count + trnCountinBlock;
                callback(count);
                done();
            } catch (error) {
                console.error(`Bad Calculate block: ${i} ${error}`);
                done();
            }
        })
    }
}
if (argv) {
    if (argv.from && argv.to && argv.order) {
        console.log('Scan and save from to Started ..... ');
        saveBlockTransactionFromTo(argv.from, argv.to, argv.order);
    }
    if(argv.calculatecount && argv.from && argv.to){
        console.log('Calculate start');
        calculateCountTransactionFromTo(argv.from, argv.to, count=>{
            console.log('Count transaction: ' + count);
        });
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
    if (argv.saveblock && argv.saveblock > 0) {
        getETHRpc.getBlockData(argv.saveblock)
        .then(block => {
            saveBlockTransactionToMongoDb(block)
                .then(res=>{
                    console.log(res);
                })
                .catch(e=>{
                    console.error('Error ' + e);
                })
        })
        .catch(e=>{
            console.log(e);
        })
    }
}




require('../models/BlockTransactionModel.js');
const getETHRpc = require('../controllers/getETHRpc').getTransactionFromETH;
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


function saveBlockTransactionToMongoDb(blockData){
    return new Promise((resolve,reject)=>{
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
function getLastBlockTransactionMongoDb(){
    return new Promise((resolve,reject)=>{
        try{
            BlockTransaction
                .findOne({})
                .sort({block:-1})
                .then(res=>{
                    res.block ? resolve(res.block) : reject(new Error(`function getLastBlockTransactionMongoDb no block number`));
                })
                .catch(e=>reject(e));
        } catch(error){
            reject(error);
        }
    });
}
async function saveBlockTransactionLastinMongoDb(order){
    if(!order) return LoggerTransactionToDbError.error('function saveBlockTransactionLastinMongoDb order is empty');
    try {
        let lastBlockInMongoDb = await getLastBlockTransactionMongoDb();
        let lastBlockInEthereum = await getETHRpc.getBlockNumber('latest');
        saveBlockTransactionFromTo(lastBlockInMongoDb+1, lastBlockInEthereum, order);
    } catch (error) {
        LoggerTransactionToDbError.error('function saveBlockTransactionLastinMongoDb ' + error);
    }
    
}
async function saveBlockTransactionFromTo(from, to, order){
    const taskQue = new Quequ(order);
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done=>{  
            try {
                blockData = await getETHRpc(i);
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
if(argv){
    if(argv.from && argv.to && argv.order){
        saveBlockTransactionFromTo(argv.from,argv.to, argv.order);
    }
    if(argv.latest && argv.order){
        saveBlockTransactionLastinMongoDb(argv.order);
    }
    if(argv.getlastblock){
        getETHRpc.getBlockNumber('latest').then(block=>{
            console.log(block);
        })
    }
    if(argv.getblock && argv.getblock>0){
        getETHRpc.getBlockData(argv.getblock).then(block=>{
            console.log(block);
        })
    }
}



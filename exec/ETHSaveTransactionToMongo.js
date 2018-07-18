if(!global.appRoot) {
    const path = require('path');
    global.appRoot = path.resolve(__dirname);
    global.appRoot = global.appRoot.replace('/exec','');
}
require(`${appRoot}/models/EthereumTransactionModel.js`);
require(`${appRoot}/models/EthereumTempTxsModel.js`);
const getETHRpc = require(`${appRoot}/lib/ethereum/getETHRpc`);
const Units = require('ethereumjs-units');
const utils = require(`${appRoot}/lib/ethereum/utilsETH`);
const math = require('mathjs');
const Quequ = require(`${appRoot}/lib/TaskQueue`);
const mongodbConnectionString = require(`${appRoot}/config/config.json`).mongodbConnectionString;

//Intel logger setup
const intel = require('intel');
const LoggerTransactionToDbError = intel.getLogger('transactionsToDbError');
const LoggerTransactionToDbBadBlock = intel.getLogger('transactionsToDbBadBlock');
LoggerTransactionToDbBadBlock.setLevel(LoggerTransactionToDbBadBlock.INFO)
    .addHandler(new intel.handlers.File(`${appRoot}/logs/transactionsToDb/badblock.log`));
LoggerTransactionToDbError.setLevel(LoggerTransactionToDbError.ERROR)
    .addHandler(new intel.handlers.File(`${appRoot}/logs/transactionsToDb/error.log`));
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
//dbEthertransactionsLib
const dbEthertransactionsLib = require(`${appRoot}/lib/mongodb/ethtransactions.js`);

//Arguments listener
const argv = require('minimist')(process.argv.slice(2));
async function getTransactionFromETH(numBlock) {
    const blockData = await getETHRpc.getBlockData(numBlock);
    let blockTransaction = [];
    await Promise.all(blockData.transactions.map(async (element) => {
        let transaction = {};
        transaction.from = element.from;
        transaction.to = element.to;
        element.gas = math.bignumber(utils.convertHexToInt(element.gas)).toFixed();
        element.gasPrice = math.bignumber(utils.convertHexToInt(element.gasPrice)).toFixed();
        transaction.value = Units.convert(math.bignumber(utils.convertHexToInt(element.value)).toFixed(), 'wei', 'eth'); //unexpect 0x26748d96b29f5076000 value not support
        transaction.fee = Units.convert(element.gas * element.gasPrice, 'wei', 'eth');
        transaction.hash = element.hash;
        const gas = await getETHRpc.getGasFromTransactionHash(element.hash);
        let gasUse = math.bignumber(gas.gasUsed);
        console.log(gas.status);
        transaction.status = gas.status;
        let gasPrice = math.bignumber(Units.convert(element.gasPrice, 'wei', 'eth'));
        transaction.fee = math.multiply(gasPrice, gasUse).toFixed();
        transaction.timestamp = utils.convertHexToInt(blockData.timestamp);
        transaction.blockNum = utils.convertHexToInt(element.blockNumber);
        transaction.input = element.input;
        transaction.input.to = transaction.input.to || '0x0';
        transaction.input.value = transaction.input.value
            ? utils.toBigNumber(transaction.input.value).toString()
            : '0';
        transaction.input.from = transaction.input.from || '0x0';
        blockTransaction.push(transaction);
    }));
    return blockTransaction.length > 0 ? blockTransaction : null;
}

async function saveBlockTransactionFromTo(from, to, order, clearTemp = false) {
    const taskQue = new Quequ(order);
    for (let i = from; i <= to; i++) {
            taskQue.pushTask(async done => {
            try {
                let blockData = await getTransactionFromETH(i);
                if (blockData) {
                    await Promise.all(blockData.map(async (element) => {
                        await dbEthertransactionsLib.saveBlockTransactionToMongoDb(element);
                        if (clearTemp) await dbEthertransactionsLib
                            .removeTempTansaction(element.hash);
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
async function calculateCountTransactionFromTo(from, to, callback) {
    const taskQue = new Quequ(10);
    let count = 0;
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done => {
            try {
                getETHRpc.getTransactionCountETH(i).then(trnCountinBlock => {
                    count = count + trnCountinBlock;
                    if (i === to) {
                        callback(count);
                    }
                    done();
                });
            } catch (error) {
                console.error(`Bad Calculate block: ${i} ${error}`);
                done();
            }
        })
    }
}
async function scan () {
    try {
        const lastBlockN = await dbEthertransactionsLib.getLastMongoBlock();
        const hBlockN = await getETHRpc.getLatestBlock();
        const highestBlockN = parseInt(hBlockN.number, 16);
        if(highestBlockN > lastBlockN)
            saveBlockTransactionFromTo(lastBlockN + 1, highestBlockN, 10, true)
                .then(() => {
                    console.log('Scanning complete at ' + Date());
                })
                .catch(err => {
                    LoggerTransactionToDbError.error(`Scannning error: ${err}`);
                });
    } catch (err) {
        console.log(err);
    }
}
if (argv) {
    if (argv.from && argv.to && argv.order) {
        console.log('Scan and save from to Started ..... ');
        saveBlockTransactionFromTo(argv.from, argv.to, argv.order);
    }
    if (argv.calculatecount && argv.from && argv.to) {
        console.log('Calculate transaction start ....');
        calculateCountTransactionFromTo(argv.from, argv.to, count => {
            console.log(`Calculate transaction done`);
            console.log('Count transaction: ' + count);
            process.exit(1);
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
                dbEthertransactionsLib.saveBlockTransactionToMongoDb(block)
                    .then(res => {
                        console.log(res);
                    })
                    .catch(e => {
                        console.error('Error ' + e);
                    })
            })
            .catch(e => {
                console.log(e);
            })
    }
    if (argv.scan) {
        console.log('Realtime Ethereum scanning...');
        scan();
    }
}
module.exports = {
   scan: scan
};



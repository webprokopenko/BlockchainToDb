if(!global.appRoot) {
    const path = require('path');
    global.appRoot = path.resolve(__dirname);
    global.appRoot = global.appRoot.replace('/exec','');
}
require(`${appRoot}/models/EthereumTransactionModel.js`);
const getETHRpc = require(`${appRoot}/lib/ethereum/getETHRpc`);

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

async function saveBlockTransactionFromTo(from, to, order) {
    const taskQue = new Quequ(order);
    for (let i = from; i <= to; i++) {
            taskQue.pushTask(async done => {
            try {
                let blockData = await getETHRpc.getTransactionFromETH(i);
                if (blockData) {
                    await Promise.all(blockData.map(async (element) => {
                        await dbEthertransactionsLib.saveBlockTransactionToMongoDb(element)
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
            saveBlockTransactionFromTo(lastBlockN + 1, highestBlockN, 10)
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



const cote = require('cote');
const math = require('mathjs');
const Units = require('ethereumjs-units');
const utils = require(`../lib/ethereum/utilsETH`);
const Quequ = require(`../lib/TaskQueue`);
const mongodbConnectionString = require(`../config/config.json`).mongodbConnectionString;
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
//dbEthertransactionsLib
const dbEthertransactionsLib = require(`../lib/mongodb/ethtransactions.js`);
const scannerError = require(`../errors/ScannerError`);
const handlerErr = require(`../errors/HandlerErrors`);

const ScanLogModel = require('../lib/mongodb/scanLog');

const requester = new cote.Requester({ name: 'Requester' });
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber' });

async function getGasFromTransactionHash(trHash) {
    return new Promise((resolve, reject) => {
        requester.send({ type: 'getGasFromTransactionHash', trHash: trHash }, (res) => {
            resolve(res);
        });
    })
}
async function getBlockData(numBlock) {
    return new Promise((resolve, reject) => {
        requester.send({ type: 'getBlockData', blockNum: numBlock }, (res) => {
            resolve(res);
        });
    })
}
async function getTransactionFromETH(numBlock) {
    const blockData = await getBlockData(numBlock);
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
        const gas = await getGasFromTransactionHash(element.hash);
        let gasUse = math.bignumber(gas.gasUsed);
        transaction.status = true;
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
async function saveBlockTransactionFromTo(from, to, order) {
    console.log(`Scan from ${from} to ${to} starting... `);
    const taskQue = new Quequ(order);
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done => {
            try {
                let blockData = await getTransactionFromETH(i);
                if (blockData) {
                    await Promise.all(blockData.map(async (element) => {
                        await dbEthertransactionsLib.saveBlockTransactionToMongoDb(element);
                    }));
                }
                console.log(`BlockNum: ${i}`);
                if(i === to){
                    console.log('Finish!');
                    //requester.send({type: 'arbit action', lastBlock:i},(res) => {console.log(res);});
                } 
                done();
            } catch (error) {
                if(parseInt(error.code) !== 11000){
                    new handlerErr(new scannerError(`saveBlockTransactionFromTo Error Message: ${error}`, i, 'eth'));
                }
                done();

            }
            done();
        })
    }
}
function getAllBadBlocksFromLogs() {
    console.log(`Scan bad blocks starting... `);
    return new Promise((resolve, reject) => {
        ScanLogModel.getLogs()
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            })
    })
}
async function parseBadBlocks() {
    const taskQue = new Quequ(10);
    taskQue.pushTask(async done => {
        try {
            let badBlocks = await getAllBadBlocksFromLogs();
            if (badBlocks) {
                await Promise.all(badBlocks.map(async (element) => {
                    let blockData = await getTransactionFromETH(element.blockNum)
                    if (blockData) {
                        await Promise.all(blockData.map(async (tr) => {
                            dbEthertransactionsLib.saveBlockTransactionToMongoDb(tr)
                            .then(() => {
                                ScanLogModel.setStatusTrueLogByBlockId(tr.blockNum);
                                console.log(`Bad BlockNum: ${tr.blockNum}`);
                            })
                            .catch(e => {
                                console.log('Not Save!!');
                                ScanLogModel.setLastTryLogByBlockId(element.blockNum);
                            })
                        }));
                    }
                }));
            }
            done();
        } catch (error) {
            console.log(error);
            done();
        }
    })
}

try {
    requester.send({type: 'arbit action'},(res) => {console.log(res);});

    subscriber.on('update range', (update) => {
       console.log(update.from);
       console.log(update.to);
        saveBlockTransactionFromTo(321450, 321640 ,10);    
    });

    // getTransactionFromETH(300004)
    //     .then(data=>{
    //         console.log(data);
    //     })
    //     .catch(e=>{
    //         console.log(e);
    //     })

    //parseBadBlocks();
    //saveBlockTransactionFromTo(320140,320160,10);    
    //ScanLogModel.setStatusTrueLogByBlockId(300003);

} catch (error) {
    console.log(error);
}
const math = require('mathjs');
const Units = require('ethereumjs-units');
const utils = require(`../ethereum/utilsETH`);
const gethRPC = require(`../ethereum/getETHRpc`);
const Quequ = require(`../TaskQueue`);
const mongodbConnectionString = require(`../../config/config.json`).mongodbConnectionString;
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
//dbEthertransactionsLib
const dbEthertransactionsLib = require(`../mongodb/ethtransactions.js`);
const scannerError = require(`../../errors/ScannerError`);
const handlerErr = require(`../../errors/HandlerErrors`);

const ScanLogModel = require(`../mongodb/scanLog`);

async function getTransactionFromETH(numBlock) {
    try {
        const blockData = await gethRPC.getBlockData(numBlock);
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
            const gas = await gethRPC.getGasFromTransactionHash(element.hash);
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
    } catch (error) {
        new handlerErr(error);
    }   
}
async function scan(from, to ,updateRange) {
    if(to>from){
        saveBlockTransactionFromTo(from, to, 10, function (lastBlock) {
            updateRange(lastBlock);
        })
    }else{
        console.log('to<=from');
        console.log('from '+ from);
        console.log('to ' + to);
        updateRange(to);
    }
}
async function saveBlockTransactionFromTo(from, to, order, finishMethod) {
    try {
        console.log(`Scan from ${from} to ${to} starting... `);
        const taskQue = new Quequ(order);
        for (let i = from; i <= to; i++) {
            taskQue.pushTask(async done => {
                let blockData = await getTransactionFromETH(i);
                if (blockData) {
                    try {
                        await Promise.all(blockData.map(async (element) => {
                            await dbEthertransactionsLib.saveBlockTransactionToMongoDb(element);
                        }));
                    } catch (error) {
                        if (parseInt(error.code) !== 11000) {
                            new handlerErr(new scannerError(`saveBlockTransactionToMongoDb Error Message: ${error}`, i, 'eth'));
                        }
                    }
                }
                console.log(`BlockNum: ${i}`);
                if (i === to) {
                    console.log('Finish!');
                    finishMethod(i);
                }
                done();
            })
        }
    } catch (error) {
        if (parseInt(error.code) !== 11000) {
            new handlerErr(new scannerError(`saveBlockTransactionFromTo Error Message: ${error}`, i, 'eth'));
        }
        done();
    }
}
async function checkBadBlocks(order, finishMethod) {
    const taskQue = new Quequ(order);
        let badBlocks = await ScanLogModel.getLogs('eth');
        if (badBlocks) {
            await Promise.all(badBlocks.map(async (element) => {
                try {
                    taskQue.pushTask(async done => {
                        let blockData = await getTransactionFromETH(element.blockNum)
                        if (blockData) {
                            await Promise.all(blockData.map(async (tr) => {
                                dbEthertransactionsLib.saveBlockTransactionToMongoDb(tr)
                                    .then(() => {
                                        ScanLogModel.setStatusTrueLogByBlockId(tr.blockNum);
                                        console.log(`Bad BlockNum: ${tr.blockNum}`);
                                        (tr.blockNum == badBlocks[badBlocks.length-1].blockNum) ? finishMethod() : null; 
                                        
                                    })
                                    .catch(error => {
                                        if (parseInt(error.code) !== 11000) {
                                            ScanLogModel.setLastTryLogByBlockId(element.blockNum,error);
                                            (tr.blockNum == badBlocks[badBlocks.length-1].blockNum) ? finishMethod() : null; 
                                            console.log(`Not Save!! ${tr.blockNum}`);
                                        }else{
                                            ScanLogModel.setStatusTrueLogByBlockId(tr.blockNum);
                                        }
                                    })
                            }));
                        }
                        done();
                    })
                } catch (error) {
                    new handlerErr(new scannerError(`getTransactionFromETH Error Message: ${error}`, element.blockNum, 'eth'));
                }
            }));
        }
}
module.exports = {
    saveBlockTransactionFromTo: saveBlockTransactionFromTo,
    getTransactionFromETH: getTransactionFromETH,
    checkBadBlocks: checkBadBlocks,
    scan: scan
};
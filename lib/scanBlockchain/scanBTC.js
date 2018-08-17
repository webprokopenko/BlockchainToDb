const BitKind = require('../../lib/BitKind');
const config = require('../../config/config.json').BTCRpc;
const scannerError = require('../../errors/ScannerError');
const handlerErr = require(`../../errors/HandlerErrors`);
const ScanLogModel = require('../../lib/mongodb/scanLog');
const Queue = require('../../lib/TaskQueue');
const BitKindRpc = require('../../lib/BitKindRpc');
const Rpc = new BitKindRpc(config,'btc');
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(require('../../config/config.json').mongodbConnectionString);
//BTG
const BTCTransactionLib = require('../../lib/mongodb/btctransactions');
const BGOLD = new BitKind(config, BTCTransactionLib, 'btc');
const saveBlockTransactionFromTo = async(from, to, order, finishMethod, clearTemp = false) => {
    const taskQue = new Queue(order);
    for (let i = from; i <= to; i++) {
        taskQue.pushTask(async done => {
            try {
                let blockData = await Rpc.getTransactionsFromBlock(i);
                if (blockData) {
                    await Promise.all(blockData.map(async (element) => {
                        await BTCTransactionLib.saveTransactionToMongoDb(element);
                        if (clearTemp) await BTCTransactionLib
                            .removeTempTransaction(element.txid);
                    }));
                }
                console.log(`BlockNum: ${i}`);
                done();
            } catch (error) {
                if (parseInt(error.code) !== 11000) {
                    new handlerErr(new scannerError(`saveBlockTransactionToMongoDb Error Message: ${error}`, i, 'btg'));
                }
                done();
            }
            if (i === to) {
                finishMethod(i);
            }
        })
    }
}
const scan = async (from, to, updateRange) => {
    if(to>from){
        saveBlockTransactionFromTo(from, to, 10,(lastBlock) => {
            updateRange(lastBlock);
        })
    }else{
        console.log('to<=from');
        console.log('from '+ from);
        console.log('to ' + to);
        updateRange(to);
    }
}
const checkDBTransactionByBlockNum = async () => {
    try {
        const taskQue = new Queue(10);
        let from = await BGOLD.transactionLib.getFirstBlock();
        let to = await BGOLD.transactionLib.getLastBlock();
        for (let i = from; i <= to; i++) {
            taskQue.pushTask(async done => {
                BGOLD.transactionLib.getBlockByBlockNum(i)
                    .then(() => {
                        done();
                    })
                    .catch(error => {
                        new handlerErr(new scannerError(`checkDBTransactionByBlockNum Error Message: ${error}`, i, 'btg'));
                        done();
                    })
            })
        }
    } catch (error) {
        new handlerErr(new Error(`scan BTG, checkDBTransactionByBlockNum() Error Message: ${error}`));
    }
}
const checkBadBlocks = async (order, finishMethod) => {
    const taskQue = new Queue(order);
    let badBlocks = await ScanLogModel.getLogs('btg');
    if (badBlocks) {
        await Promise.all(badBlocks.map(async (element) => {
            try {
                taskQue.pushTask(async done => {
                    let blockData = await BGOLD.getTransactionsFromBlock(element.blockNum);
                    if (blockData) {
                        await Promise.all(blockData.map(async (tr) => {
                            BTCTransactionLib.saveTransactionToMongoDb(tr)
                                .then(() => {
                                    ScanLogModel.setStatusTrueLogByBlockId(tr.blockheight);
                                    (tr.blockheight == badBlocks[badBlocks.length - 1].blockNum) ? finishMethod() : null;

                                })
                                .catch(error => {
                                    new handlerErr(new scannerError(`checkBadBlocks Error Message: ${error}`, element.blockNum, 'btg'));
                                    ScanLogModel.setLastTryLogByBlockId(element.blockNum);
                                    (tr.blockheight == badBlocks[badBlocks.length - 1].blockNum) ? finishMethod() : null;

                                })
                        }));
                    }
                    done();
                })
            } catch (error) {
                console.log(error);
                new handlerErr(new scannerError(`checkBadBlocks Error Message: ${error}`, element.blockNum, 'btg'));
            }
        }));
    }
}
module.exports = {
    saveBlockTransactionFromTo:     saveBlockTransactionFromTo,
    scan:                           scan,
    checkDBTransactionByBlockNum:   checkDBTransactionByBlockNum,
    checkBadBlocks:                 checkBadBlocks
}
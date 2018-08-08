const BitKind = require('../../lib/BitKind');
const config = require('../../config/config.json').BTGRpc;
const scannerError = require('../../errors/ScannerError');
const handlerErr = require(`../../errors/HandlerErrors`);
const ScanLogModel = require('../../lib/mongodb/scanLog');
const Queue = require('../../lib/TaskQueue');
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(require('../../config/config.json').mongodbConnectionString);
//BTG
const BTGTransactionLib = require('../../lib/mongodb/btgtransactions');
const BGOLD = new BitKind(config, BTGTransactionLib, 'btg');

const scan = async (from, to, updateRange) => {
    console.log(`Start scan from : ${from} to : ${to}`);
    BGOLD.saveBlockTransactionFromTo(from, to, 10,(lastBlock) => {
        updateRange(lastBlock);
    })
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
                            BTGTransactionLib.saveTransactionToMongoDb(tr)
                                .then(() => {
                                    ScanLogModel.setStatusTrueLogByBlockId(tr.blockheight);
                                    (tr.blockheight == badBlocks[badBlocks.length - 1].blockNum) ? finishMethod() : null;

                                })
                                .catch(e => {
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
    scan: scan,
    checkDBTransactionByBlockNum: checkDBTransactionByBlockNum,
    checkBadBlocks: checkBadBlocks
}
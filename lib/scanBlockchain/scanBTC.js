const BitKind = require('../../lib/BitKind');
const config = require('../../config/config.json').BTCRpc;
const scannerError = require('../../errors/ScannerError');
const handlerErr = require(`../../errors/HandlerErrors`);
const ScanLogModel = require('../../lib/mongodb/scanLog');
const Queue = require('../../lib/TaskQueue');
const BitKindRpc = require('../../lib/BitKindRpc');
const Rpc = new BitKindRpc(config, 'btc');
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(require('../../config/config.json').mongodbConnectionString);
//BTC
const BTCTransactionLib = require('../../lib/mongodb/btctransactions');
const BTC = new BitKind(config, BTCTransactionLib, 'btc');
const saveBlockTransactionFromTo = async (from, to, order, finishMethod, clearTemp = true) => {
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
                console.log(`BlockNum BTC: ${i}`);
                done();
            } catch (error) {
                if (parseInt(error.code) !== 11000) {
                    new handlerErr(new scannerError(`saveBlockTransactionToMongoDb Error Message: ${error}`, i, 'btc'));
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
    if (to > from) {
        saveBlockTransactionFromTo(from, to, 10, (lastBlock) => {
            updateRange(lastBlock);
        })
    } else {
        console.log('to<=from');
        console.log('from ' + from);
        console.log('to ' + to);
        updateRange(to);
    }
}
const scanIndexer = async () => {
    try {
        let from = await BTCTransactionLib.getLastBlock();
        let to = await Rpc.getBlockCount();
        console.log(`Scan BTC Indexer Start!!! from: ${from} to: ${to}`);
        scan(from, to, (lastBlock) => {
            // checkBadBlocks(10, () => {
            //     console.log('Check bad blocks finish');
            // })
            // checkDBTransactionByBlockNum()
            //     .then(data => {
            //         console.log('Finish check DB')
            //     })
            console.log('Finish scan indexer' + lastBlock);
        })    
    } catch (error) {
        new handlerErr(new Error(error));
    }
    
}
const checkDBTransactionByBlockNum = async () => {
    try {
        const taskQue = new Queue(10);
        let from = await BTC.transactionLib.getFirstBlock();
        let to = await BTC.transactionLib.getLastBlock();
        for (let i = from; i <= to; i++) {
            taskQue.pushTask(async done => {
                BTC.transactionLib.getBlockByBlockNum(i)
                    .then(() => {
                        done();
                    })
                    .catch(error => {
                        new handlerErr(new scannerError(`checkDBTransactionByBlockNum Error Message: ${error}`, i, 'btc'));
                        done();
                    })
            })
        }
    } catch (error) {
        new handlerErr(new Error(`scan BTC, checkDBTransactionByBlockNum() Error Message: ${error}`));
    }
}
const checkBadBlocks = async (order, finishMethod) => {
    const taskQue = new Queue(order);
    let badBlocks = await ScanLogModel.getLogs('btc');
    if (badBlocks) {
        await Promise.all(badBlocks.map(async (element) => {
            try {
                taskQue.pushTask(async done => {
                    let blockData = await Rpc.getTransactionsFromBlock(element.blockNum);
                    if (blockData) {
                        await Promise.all(blockData.map(async (tr) => {
                            BTCTransactionLib.saveTransactionToMongoDb(tr)
                                .then(() => {
                                    ScanLogModel.setStatusTrueLogByBlockId(tr.blockheight);
                                    (tr.blockheight == badBlocks[badBlocks.length - 1].blockNum) ? finishMethod() : null;

                                })
                                .catch(error => {
                                    new handlerErr(new scannerError(`checkBadBlocks Error Message: ${error}`, element.blockNum, 'btc'));
                                    ScanLogModel.setLastTryLogByBlockId(element.blockNum);
                                    (tr.blockheight == badBlocks[badBlocks.length - 1].blockNum) ? finishMethod() : null;

                                })
                        }));
                    }
                    done();
                })
            } catch (error) {
                console.log(error);
                new handlerErr(new scannerError(`checkBadBlocks Error Message: ${error}`, element.blockNum, 'btc'));
            }
        }));
    }
}
module.exports = {
    saveBlockTransactionFromTo: saveBlockTransactionFromTo,
    scan: scan,
    checkDBTransactionByBlockNum: checkDBTransactionByBlockNum,
    checkBadBlocks: checkBadBlocks,
    scanIndexer: scanIndexer
}
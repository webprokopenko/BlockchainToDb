require('../../models/ScanLogModel.js');
const mongoose = require('mongoose');
const ScanLog = mongoose.model('ScanLog');

async function InsertLog(data){
    return new Promise((resolve, reject) => {
        try {
            const blockData = new ScanLog(data);
            blockData.save()
                .then(() => {
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
async function setStatusTrueLogByBlockId(blockNum) {
    return new Promise((resolve, reject) => {
        try {
            ScanLog
            .findOneAndUpdate({blockNum:blockNum}, {$set:{status:true,dateLastScan:new Date()}}, {new: true})
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err)
            })
        } catch (error) {
            reject(error);
        }
    })
}
async function setLastTryLogByBlockId(blockNum,error) {
    return new Promise((resolve, reject) => {
        try {
            ScanLog
            .findOneAndUpdate({blockNum:blockNum}, {$set:{dateLastScan:new Date(),errorMessage:error}}, {new: true})
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err)
            })
        } catch (error) {
            reject(error);
        }
    })
}
async function getLogs(blockchain) {
    return new Promise((resolve, reject) => {
        try {
            ScanLog
            .find()
            .where({'status': false , 'blockchain': blockchain})
            .select('-_id -__v')
            .then(res => {
                res ? resolve(res) : reject(new Error(`function getLogs no block number blockchain: ${blockchain}`));
            })
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    InsertLog: InsertLog,
    getLogs: getLogs,
    setStatusTrueLogByBlockId: setStatusTrueLogByBlockId,
    setLastTryLogByBlockId: setLastTryLogByBlockId
}
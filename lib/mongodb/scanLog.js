require('../../models/ScanLogModel.js');
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
async function getLogs() {
    return new Promise((resolve, reject) => {
        try {
            ScanLog
            .find()
            .where({'status': false })
            .select('-_id -__v')
            .then(res => {
                res ? resolve(res) : reject(new Error(`function getLogs no block number`));
            })
        } catch (error) {
            reject(error);
        }
    })
}
module.exports = {
    InsertLog: InsertLog,
    getLogs: getLogs
}
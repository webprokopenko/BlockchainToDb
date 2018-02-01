const mongoose = require('mongoose');
require('../models/BlockTransactionModel.js');
const BlockTransaction = mongoose.model('blockTransaction');
const getETHRpc = require('../controllers/getETHRpc');
const Quequ = require('../lib/TaskQueue');
const intel = require('intel');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://root:root@ds211588.mlab.com:11588/eth_scan');

var argv = require('minimist')(process.argv.slice(2));


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
async function saveBlockTransactionFromTo(from, to, order){
    intel.basicConfig({
        'file': '../logs/error.log', 
        'format': '%(message)s',
        'level': intel.ERROR
      });

    const taskQue = new Quequ(order);
    for (let i = from; i < to; i++) {
        taskQue.pushTask(async done=>{  
            try {
                blockData = await getETHRpc(i);
                await saveBlockTransactionToMongoDb(blockData);
                console.log(` Write OK! ${i}`);
                done();    
            } catch (error) {
                intel.error('Error from SaveTransactionToMongo: ' + error );
                intel.error('Bad block: ' + i);
                done();
            }
        })
    }
}
if(argv){
    console.log(argv);
    if(argv.from && argv.to && argv.order){
        saveBlockTransactionFromTo(argv.from,argv.to, argv.order);
    }
}



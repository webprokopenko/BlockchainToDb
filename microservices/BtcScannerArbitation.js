const cote = require('cote');
const BitKind = require('../lib/BitKind');
const config = require('../config/config.json').BTCRpc;
const handlerErr = require(`../errors/HandlerErrors`);
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(require(`../config/config.json`).mongodbConnectionString);

const responder = new cote.Responder({ name: 'arbitration scanner BTC' });
const publisher = new cote.Publisher({ name: 'arbitration publisher BTC' });

const BTGTransactionLib = require('../lib/mongodb/btctransactions');
const BTC = new BitKind(config, BTGTransactionLib, 'btc');


async function getLastBlockfromDB() {
    return new Promise((resolve, reject) => {
        BTC.transactionLib.getLastBlock()
            .then(lastBlock => {
                resolve(lastBlock);
            })
            .catch(error => {
                reject(error);
            })
    });
}
async function getLastBlockfromBlockchain() {
    return new Promise((resolve, reject) => {
        BTC.Rpc.getBlockCount()
            .then(lastBlock => {
                resolve(lastBlock);
            })
            .catch(error => {
                reject(error);
            })
    });
}

responder.on('start scan BTC', async (req, cb) => {
    console.log('Arbitation start scan BTC');
    try {
        let range = {}
        if(req.lastBlock){
             range.from = req.lastBlock;
             range.to =  await getLastBlockfromBlockchain()
        }else{
            range.from = await getLastBlockfromDB();
            range.to =  await getLastBlockfromBlockchain();
        }
        publisher.publish('update range BTC', range);    
    } catch (error) {
        new handlerErr(error)    
    }
    
})
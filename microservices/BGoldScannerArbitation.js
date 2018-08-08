const cote = require('cote');
const BitKind = require('../lib/BitKind');
const config = require('../config/config.json').BTGRpc;

//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(require(`../config/config.json`).mongodbConnectionString);

const responder = new cote.Responder({ name: 'arbitration scanner BTG' });
const publisher = new cote.Publisher({ name: 'arbitration publisher BTG' });

const BTGTransactionLib = require('../lib/mongodb/btgtransactions');
const BGOLD = new BitKind(config, BTGTransactionLib, 'btg');


async function getLastBlockfromDB() {
    return new Promise((resolve, reject) => {
        BGOLD.transactionLib.getLastBlock()
            .then(lastBlock => {
                resolve(lastBlock);
            })
    });
}
async function getLastBlockfromBlockchain() {
    return new Promise((resolve, reject) => {
        BGOLD.getBlockCount()
            .then(lastBlock => {
                resolve(lastBlock);
            })
    });
}

responder.on('start scan BTG', async (req, cb) => {
    let range = {}
    if(req.lastBlock){
         range.from = req.lastBlock;
         range.to =  await getLastBlockfromBlockchain()
    }else{
        range.from = await getLastBlockfromDB();
        range.to =  await getLastBlockfromBlockchain();
    }
    publisher.publish('update range BTG', range);
})
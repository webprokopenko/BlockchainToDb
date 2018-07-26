const cote = require('cote');
const mongodbConnectionString = require(`../config/config.json`).mongodbConnectionString;
const utils = require(`../lib/ethereum/utilsETH`);
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
//dbEthertransactionsLib
const dbEthertransactionsLib = require(`../lib/mongodb/ethtransactions.js`);

const responder = new cote.Responder({ name: 'arbitration scanner' });
const publisher = new cote.Publisher({ name: 'arbitration publisher' });
const EthDaemon = new cote.Requester({ name: 'Requester EthDaemon' });

let range = {};

async function getLastBlockfromDB(){
    return new  Promise((resolve, reject) => {
        dbEthertransactionsLib.getLastMongoBlock()
            .then(last => {
                resolve(last);
            })
        
    });
}
async function getLatestBlockfromEth() {
     return new Promise((resolve, reject) => {
        EthDaemon.send({ type: 'getLatestBlock'}, (res) => {
            resolve(parseInt(res.number, 16)) 
        });
    })
}

responder.on('arbit action', (req, cb) => {
    console.log('arbit action');
    console.log(req);
    range.from = 320450;//await getLastBlockfromDB();
    range.to =  320640// await getLatestBlockfromEth();
    console.log(req.lastBLock);
    if(req.lastBLock){
        console.log('getLastBlock: !!' + req.lastBLock)
        range.from = req.lastBLock;//await getLastBlockfromDB();
        range.to =  320680// await getLatestBlockfromEth();
    }
    

    publisher.publish('update range', range);
});
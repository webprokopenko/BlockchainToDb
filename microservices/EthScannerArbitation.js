const cote = require('cote');
const mongodbConnectionString = require(`../config/config.json`).mongodbConnectionString;
const handlerErr = require(`../errors/HandlerErrors`);
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
//dbEthertransactionsLib
const dbEthertransactionsLib = require(`../lib/mongodb/ethtransactions.js`);
const gethEth = require('../lib/ethereum/getETHRpc');
const responder = new cote.Responder({ name: 'arbitration scanner ETH' });
const publisher = new cote.Publisher({ name: 'arbitration publisher ETH' });
// const EthDaemon = new cote.Requester({ name: 'Requester EthDaemon' });

async function getLastBlockfromDB(){
    return new  Promise((resolve, reject) => {
        dbEthertransactionsLib.getLastMongoBlock()
            .then(last => {
                resolve(last);
            }).catch(e=>{
                reject(e);
            })
        
    });
}
async function getLatestBlockfromEth() {
     return new Promise((resolve, reject) => {
         try {
            gethEth.getBlockNumber()
                .then(block =>{
                    resolve(block);
                })
                .catch(e => {
                    reject(e);
                })
         } catch (error) {
             console.log('getLatestBlockfromEth');
             reject(error);
         }
    })
}
responder.on('start scan ETH', async(req, cb) => {
    try {
        let range = {};
        if(req.lastBLock){
            console.log('getLastBlock: !!' + req.lastBLock)
            range.from = req.lastBLock;
            range.to = await getLatestBlockfromEth();
        }else{
            range.from = await getLastBlockfromDB();
            range.to =  await getLatestBlockfromEth();
        }    
    } catch (error) {
        new handlerErr(error) 
    }
    
    publisher.publish('update range ETH', range);
});
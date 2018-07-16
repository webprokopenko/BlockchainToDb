//set global AppDirectory
const path = require('path');
global.appRoot = path.resolve('../');

const cote = require('cote');
const gethRPC = require('../lib/ethereum/getETHRpc');

const EthDaemon = new cote.Responder({name:'Ethereum Daemon'});

EthDaemon.on('getBlockNumber', (req, cb) => {
    console.log(req.blockNum);
    gethRPC.getBlockNumber(req.blockNum)
    .then(data=>{
        cb(data);
    })
    
})    
EthDaemon.on('getGasPrice', (req, cb) => {
    gethRPC.getGasPrice()
    .then(data=>{
        cb(data);
    })
})  
EthDaemon.on('getLatestBlock', (req, cb) => {
    gethRPC.getLatestBlock()
    .then(data=>{
        cb(data);
    })
})  


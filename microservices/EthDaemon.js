const cote = require('cote');
const gethRPC = require('../lib/ethereum/getETHRpc');

const EthDaemon = new cote.Responder({name:'Ethereum Daemon'});

EthDaemon.on('getBlockData', (req, cb) => {
    gethRPC.getBlockData(req.blockNum)
    .then(data=>{
        cb(data);
    })
    
})    
EthDaemon.on('getBlockNumber', (req, cb) => {
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
EthDaemon.on('getBalance', (req, cb) => {
    gethRPC.getBalance(req.address)
    .then(data=>{
        cb(data);
    })
})  
EthDaemon.on('getTransactionCount', (req, cb) => {
    gethRPC.getTransactionCount(req.address)
    .then(data=>{
        cb(data);
    })
})  
EthDaemon.on('sendRawTransaction', (req, cb) => {
    gethRPC.sendRawTransaction(req.rawTransaction)
    .then(data=>{
        cb(data);
    })
})
EthDaemon.on('getTransactionFromHash', (req, cb) => {
    gethRPC.getTransactionFromHash(req.trHash)
    .then(data=>{
        cb(data);
    })
})
EthDaemon.on('getGasFromTransactionHash', (req, cb) => {
    gethRPC.getGasFromTransactionHash(req.trHash)
    .then(data=>{
        cb(data);
    })
})







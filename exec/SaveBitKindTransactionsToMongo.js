const mongoose = require('mongoose');
global.mongoose = (global.mongoose ? global.mongoose : mongoose.createConnection(require('../config/config.json').mongodbConnectionString));
const path = require('path');
global.appRoot = path.resolve(__dirname);
global.appRoot = global.appRoot.replace('/exec','');
const bitSave = require('./BitKindTransactionsToMongo');
const getRpc = require(`${appRoot}/lib/bitcoin/getBTCbitcoin`);

const argv = require('minimist')(process.argv.slice(2));
if (argv.from && argv.to && argv.order && argv.code) {
    console
        .log(`Scan and save ${argv.code} from:${argv.from} to:${argv.to} Start... `);
    bitSave.saveBlockTransactionFromTo(argv.from, argv.to, argv.order, argv.code);
}
if (argv.getblock && argv.getblock > 0) { // argv.getblock = block number
    getRpc.getBlockHash(argv.getblock)
    .then(hash => {
        getRpc.getBlockData(hash)
        .then(res=>{
            console.log('Result from getBlockData: ');
            console.dir(res.tx[0].vout[0].scriptPubKey.addresses);
        })
        .catch(e=>{
            console.log('error');
        })
    })
}
if(argv.gettransaction && argv.gettransaction>0){ // argv.gettransaction = block number
    getRpc.getTransactionsFromBlock(argv.gettransaction)
    .then(data=>{
        console.log('Result from getTransactionsFromBlock: ');
        console.log(data);
    })
}
if(argv.getbalance){ // argv.getbalance = account address
    getRpc.getBalance(argv.getbalance)
    .then(data=>{
        console.log('Result from getBalance: ');
        console.log(data);
    })
}
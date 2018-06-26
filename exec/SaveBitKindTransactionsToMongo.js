const mongoose = require('mongoose');
global.mongoose = (global.mongoose ? global.mongoose : mongoose.createConnection(require('../config/config.json').mongodbConnectionString));
const path = require('path');
global.appRoot = path.resolve(__dirname);
global.appRoot = global.appRoot.replace('/exec','');
const bitSave = require('./BitKindTransactionsToMongo');

let getRpc = null;
let dbTransactionLib = null;

function _init(currency) {
    const curr = {
        'BTC': {
            rpc: `${appRoot}/lib/bitcoin/getBTCbitcoin`,
            dbLib: `${appRoot}/lib/mongodb/btctransactions`
        },
        'BCH': {
            rpc: `${appRoot}/lib/bitcoin_cash/getBCHbitcoin_cash`,
            dbLib: `${appRoot}/lib/mongodb/bchtransactions`
        },
        'BTG': {
            rpc: `${appRoot}/lib/bitcoin_gold/getBTGbitcoin_gold`,
            dbLib: `${appRoot}/lib/mongodb/btgtransactions`
        },
        'LTC': {
            rpc: `${appRoot}/lib/litecoin/getLTClitecoin`,
            dbLib: `${appRoot}/lib/mongodb/ltctransactions`
        },
        'ZEC': {
            rpc: `${appRoot}/lib/zcash/getZECzcash`,
            dbLib: `${appRoot}/lib/mongodb/zectransactions`
        },
        'XMR': {
            rpc: `${appRoot}/lib/monero/getXMRmonero`,
            dbLib: `${appRoot}/lib/mongodb/xmrtransactions`
        }
    };
    if(!curr[currency]) {
        getRpc = require(`${appRoot}/lib/bitcoin/getBTCbitcoin`);
        dbTransactionLib = require(`${appRoot}/lib/mongodb/btctransactions`);
    } else {
        getRpc = require(curr[currency].rpc);
        dbTransactionLib = require(curr[currency].dbLib);
    }
}

const argv = require('minimist')(process.argv.slice(2));

if (argv.code) _init(argv.code);

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
            //console.dir(res.tx[0].vout[0].scriptPubKey.addresses);
            console.dir(JSON.stringify(res));
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
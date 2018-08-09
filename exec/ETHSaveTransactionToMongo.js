
const path = require('path');
global.appRoot = path.resolve('../');
const getETHRpc = require(`../lib/ethereum/getETHRpc`);
const scanETH = require('../lib/scanBlockchain/scanETH');
//Arguments listener
const argv = require('minimist')(process.argv.slice(2));

if (argv) {
    if (argv.from && argv.to) {
        console.log('Scan and save from to Started ..... ');
        scanETH.scan(argv.from, argv.to, ()=> {
            console.log(`Save block from: ${argv.from} to: ${argv.to} FINISHED!!!`);
        })
    }
    if (argv.getlastblock) {
        getETHRpc.getBlockNumber('latest').then(block => {
            console.log(block);
        })
    }
    if (argv.getblock && argv.getblock > 0) {
        console.log('Get block');
        getETHRpc.getBlockData(argv.getblock).then(block => {
            console.log(block);
        })
    }
    if (argv.saveblock && argv.saveblock > 0) {
        getETHRpc.getBlockData(argv.saveblock)
            .then(block => {
                dbEthertransactionsLib.saveBlockTransactionToMongoDb(block)
                    .then(res => {
                        console.log(res);
                    })
                    .catch(e => {
                        console.error('Error ' + e);
                    })
            })
            .catch(e => {
                console.log(e);
            })
    }
}



const path = require('path');
global.AppRoot = path.resolve('../');
const getETHRpc = require('../lib/ethereum/getETHRpc');
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
        console.log('Get block : ' + argv.getblock);
        getETHRpc.getBlockData(argv.getblock).then(block => {
            console.log(block);
        })
    }
    if (argv.saveblock && argv.saveblock > 0) {
        console.log('Scan and save from to Started ..... ');
        scanETH.scan(argv.saveblock-1, argv.saveblock+1, ()=> {
            console.log(`Save block from: ${argv.saveblock-1} to: ${argv.saveblock+1} FINISHED!!!`);
        })
    }
}



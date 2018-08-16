const path = require('path');
global.appRoot = path.resolve('../');
//Arguments listener
const argv = require('minimist')(process.argv.slice(2));
const BitKindRpc = require('../lib/BitKindRpc');

function _init(currency) {
    switch (currency) {
        case 'btg':
            return {
                Lib: require('../lib/scanBlockchain/scanBTG'),
                Rpc: new BitKindRpc(require('../config/config.json').BTGRpc, 'btg')
            }
        case 'btc':
            return {
                Lib: require('../lib/scanBlockchain/scanBTC'),
                Rpc: new BitKindRpc(require('../config/config.json').BTCRpc, 'btc')
            }
        default:
            return require('../lib/scanBlockchain/scanBTG');
    }
}
if (argv) {
    if (argv.from && argv.to && argv.currency) {
        console.log('Scan and save from to Started ..... ' + argv.currency);
        const ScanLib =  _init(argv.currency)
        ScanLib.Lib.scan(argv.from, argv.to, ()=> {
            console.log(`Save block ${argv.currency} from: ${argv.from} to: ${argv.to} FINISHED!!!`);
        })
    }
    else if(argv.getlastblock && argv.currency){
        console.log('getlastblock Started ..... ');
        const ScanLib =  _init(argv.currency);
        ScanLib.Rpc.getBlockCount()
            .then(lastBlock => {
                console.log(lastBlock);
            })
    }
}

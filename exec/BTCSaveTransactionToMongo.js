const   gethBTClocal = require(`../lib/bitcoin/getBTCbitcoin.js`);

//Intel logger setup
const intel = require('intel');
const BtcError = intel.getLogger('BtcError');
BtcError.setLevel(BtcError.ERROR).addHandler(new intel.handlers.File(`../logs/btc/error.log`));

function getBlockCount(){
     gethBTClocal.getBlockCount()
    .then(count=>count)
    .catch(error=>{
        return console.dir('ERROR:' + error);
    })
        
        //BtcError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
}

//let resp = getBlockCount();
gethBTClocal.getBlockHash(300000)
    .then(hash=>{
        console.log(hash);
        gethBTClocal.getBlockData(hash)
        .then(res=>{
            console.dir('Data block: ' + res.tx[0]);
        })
        .catch(err=>{
            console.dir('Error data block: ' + error);
        })
    })
    .catch(error=>{
        return console.dir('ERROR:' + error);
    })
        
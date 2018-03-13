const gethBTC = require(`${appRoot}/lib/bitcoin/getBTCbitcoin.js`);
const utils = require(`${appRoot}/lib/ethereum/utilsETH`);

//Intel logger setup
const intel = require('intel');
const BtcError = intel.getLogger('BtcError');
BtcError.setLevel(BtcError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/btc/error.log`));

async function getBalance(address){
    try {
        let balance = await gethBTC.getBalance(address);
        return {'balance':balance}
    } catch (error) {
        //BtcError.error(`${new Date()} Error: getBalance: ${error}`);
        console.log(error);
    }
}
module.exports = {
    getBalance:             getBalance,
}
const   gethBTClocal = require(`${appRoot}/lib/bitcoin/getBTCbitcoin.js`);

//Intel logger setup
const intel = require('intel');
const BtcError = intel.getLogger('BtcError');
BtcError.setLevel(BtcError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/btc/error.log`));

async function getBalance(address){
    try {
            let balance = await gethBTClocal.getBalance(address);
            return balance;
    } catch (error) {
        BtcError.error(`${new Date()} Error: getBalance: ${error}`);
    }
}
async function sendRawTransaction(raw){
    try {
        return await gethBTClocal.sendRawTransaction(raw);;
    } catch (error) {
        BtcError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
    }
}
async function getUTXOs(address){
    try{
        return await gethBTClocal.getUTXOs(address);
    }catch (error){
        BtcError.error(`${new Date()} Error: getUTXOs: ${error}`);
    }
}
async function getTxList(address){
    try{
        return await gethBTClocal.getTxsByAddress(address);
    }catch (error){
        BtcError.error(`${new Date()} Error: getTxList: ${error}`);
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getTxList:              getTxList
};
const gethBTClocal = require(`..//lib/bitcoin/getBTCbitcoin.js`),
    gethBTCremote = require(`../lib/bitcoin/getBTCbitcore.js`);

//Intel logger setup
const intel = require('intel');
const BtcError = intel.getLogger('BtcError');
BtcError.setLevel(BtcError.ERROR).addHandler(new intel.handlers.File(`../../logs/btc/error.log`));

async function getBalance(address){
    try {
        let balance = await gethBTCremote.getBalance(address);
        return {'balance':balance}
    } catch (error) {
        BtcError.error(`${new Date()} Error: getBalance: ${error}`);
    }
}
async function sendRawTransaction(raw){
    try {
        let res = await gethBTClocal.sendRawTransaciton(raw);
        return {'res':res};
    } catch (error) {
        BtcError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
    }
}
async function getUTXOs(address){
    try{
        return await gethBTCremote.getUTXOs(address);
    }catch (error){
        BtcError.error(`${new Date()} Error: getUTXOs: ${error}`);
    }
}
async function getTxList(address){
    try{
        return await gethBTCremote.getTxList(address);
    }catch (error){
        BtcError.error(`${new Date()} Error: getTxList: ${error}`);
    }
}
async function getTxById(txid){
    try{
        return await gethBTCremote.getTxById(txid);
    }catch (error){
        BtcError.error(`${new Date()} Error: getTxById: ${error}`);
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getTxList:              getTxList,
    getTxById:              getTxById
};
const   gethBCHlocal = require(`${appRoot}/lib/bitcoin_cash/getBCHbitcoin_cash.js`),
    Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`),
    bchConfig = require(`${appRoot}/config/config.json`).BCHRpc;

//Intel logger setup
const intel = require('intel');
const BchError = intel.getLogger('BchError');
BchError.setLevel(BchError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/bch/error.log`));

async function getBalance(address){
    if(!Utils.isAddress(address, bchConfig.network))
        return {error: 'Incorrect address - ' + address};
    try {
        return {balance: await gethBCHlocal.getBalance(address)};
    } catch (error) {
        BchError.error(`${new Date()} Error: getBalance: ${error}`);
        throw new Error('Service error');
    }
}
async function sendRawTransaction(raw){
    try {
        return {txid: await gethBCHlocal.sendRawTransaction(raw)};
    } catch (error) {
        BchError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
        if(error.toString().indexOf('Code-114') >= 0) {
            return {error: error.toString()};
        } else throw new Error(error);
    }
}
async function getUTXOs(address){
    if(!Utils.isAddress(address, bchConfig.network))
        return {error: 'Incorrect address - ' + address};
    try{
        return {utxos: await gethBCHlocal.getUTXOs(address)};
    }catch (error){
        BchError.error(`${new Date()} Error: getUTXOs: ${error}`);
        throw new Error('Service error');
    }
}
async function getTxList(address){
    if(!Utils.isAddress(address, bchConfig.network))
        return {error: 'Incorrect address - ' + address};
    try{
        return {txs: await gethBCHlocal.getTxsByAddress(address)};
    }catch (error){
        BchError.error(`${new Date()} Error: getTxList: ${error}`);
        throw new Error('Service error');
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getTxList:              getTxList
};
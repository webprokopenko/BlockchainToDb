const   gethBTClocal = require(`${appRoot}/lib/bitcoin/getBTCbitcoin.js`),
    Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`),
    btcConfig = require(`${appRoot}/config/config.json`).BTCRpc;

//Intel logger setup
const intel = require('intel');
const BtcError = intel.getLogger('BtcError');
BtcError.setLevel(BtcError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/btc/error.log`));

async function getBalance(address){
    if(!Utils.isAddress(address, btcConfig.network))
        return {error: 'Incorrect address - ' + address};
    try {
            return {balance: await gethBTClocal.getBalance(address)};
    } catch (error) {
        BtcError.error(`${new Date()} Error: getBalance: ${error}`);
        throw new Error('Service error');
    }
}
async function sendRawTransaction(raw){
    try {
        return {txid: await gethBTClocal.sendRawTransaction(raw)};
    } catch (error) {
        BtcError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
        if(error.toString().indexOf('Code-114') >= 0) {
            return {error: error.toString()};
        } else throw new Error(error);
    }
}
async function getUTXOs(address){
    if(!Utils.isAddress(address, btcConfig.network))
        return {error: 'Incorrect address - ' + address};
    try{
        return {utxos: await gethBTClocal.getUTXOs(address)};
    }catch (error){
        BtcError.error(`${new Date()} Error: getUTXOs: ${error}`);
        throw new Error('Service error');
    }
}
async function getTxList(address){
    if(!Utils.isAddress(address, btcConfig.network))
        return {error: 'Incorrect address - ' + address};
    try{
        return {txs: await gethBTClocal.getTxsByAddress(address)};
    }catch (error){
        BtcError.error(`${new Date()} Error: getTxList: ${error}`);
        throw new Error('Service error');
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getTxList:              getTxList
};
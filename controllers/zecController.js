const   gethZEClocal = require(`${appRoot}/lib/zcash/getZECzcash.js`),
    Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`),
    zecConfig = require(`${appRoot}/config/config.json`).ZECRpc;

//Intel logger setup
const intel = require('intel');
const ZecError = intel.getLogger('ZecError');
ZecError.setLevel(ZecError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/zec/error.log`));

async function getBalance(address){
    if(!Utils.isZAddress(address, zecConfig.network))
        return {error: 'Incorrect address - ' + address};
    try {
        return {balance: await gethZEClocal.getBalance(address)};
    } catch (error) {
        ZecError.error(`${new Date()} Error: getBalance: ${error}`);
        throw new Error('Service error');
    }
}
async function sendRawTransaction(raw){
    try {
        return {txid: await gethZEClocal.sendRawTransaction(raw)};
    } catch (error) {
        ZecError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
        if(error.toString().indexOf('Code-114') >= 0) {
            return {error: error.toString()};
        } else throw new Error(error);
    }
}
async function getUTXOs(address){
    if(!Utils.isZAddress(address, zecConfig.network))
        return {error: 'Incorrect address - ' + address};
    try{
        return {utxos: await gethZEClocal.getUTXOs(address)};
    }catch (error){
        ZecError.error(`${new Date()} Error: getUTXOs: ${error}`);
        throw new Error('Service error');
    }
}
async function getTxList(address){
    if(!Utils.isZAddress(address, zecConfig.network))
        return {error: 'Incorrect address - ' + address};
    try{
        return {txs: await gethZEClocal.getTxsByAddress(address)};
    }catch (error){
        ZecError.error(`${new Date()} Error: getTxList: ${error}`);
        throw new Error('Service error');
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getTxList:              getTxList
};
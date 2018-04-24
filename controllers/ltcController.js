const   gethLTClocal = require(`${appRoot}/lib/litecoin/getLTClitecoin.js`),
    Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`),
    ltcConfig = require(`${appRoot}/config/config.json`).LTCRpc;

//Intel logger setup
const intel = require('intel');
const LtcError = intel.getLogger('LtcError');
LtcError.setLevel(LtcError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/ltc/error.log`));

async function getBalance(address){
    if(!Utils.isAddress(address, ltcConfig.network))
        return {error: 'Incorrect address - ' + address};
    try {
        return {balance: await gethLTClocal.getBalance(address)};
    } catch (error) {
        LtcError.error(`${new Date()} Error: getBalance: ${error}`);
        throw new Error('Service error');
    }
}
async function sendRawTransaction(raw){
    try {
        return {txid: await gethLTClocal.sendRawTransaction(raw)};
    } catch (error) {
        LtcError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
        throw new Error(error);
    }
}
async function getUTXOs(address){
    if(!Utils.isAddress(address, ltcConfig.network))
        return {error: 'Incorrect address - ' + address};
    try{
        return {utxos: await gethLTClocal.getUTXOs(address)};
    }catch (error){
        LtcError.error(`${new Date()} Error: getUTXOs: ${error}`);
        throw new Error('Service error');
    }
}
async function getTxList(address){
    if(!Utils.isAddress(address, ltcConfig.network))
        return {error: 'Incorrect address - ' + address};
    try{
        return {txs: await gethLTClocal.getTxsByAddress(address)};
    }catch (error){
        LtcError.error(`${new Date()} Error: getTxList: ${error}`);
        throw new Error('Service error');
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getTxList:              getTxList
};
const gethBTClocal = require(`${appRoot}/lib/bitcoin/getBTCbitcoin.js`);
const Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`);
const btcConfig = require(`${appRoot}/config/config.json`).BTCRpc;
const handlerErr = require(`${appRoot}/errors/HandlerErrors`);

async function getBalance(address){
    if(!Utils.isAddress(address, btcConfig.network))
         throw new Error('Address not valid in Bitcoin');
    try {
        return {balance: await gethBTClocal.getBalance(address)};
    } catch (error) {
        new handlerErr(error);
    }
}
async function sendRawTransaction(raw){
    try {
        return {txid: await gethBTClocal.sendRawTransaction(raw)};
    } catch (error) {
        new handlerErr(error);
    }
}
async function getUTXOs(address){
    try{
        if(!Utils.isAddress(address, btcConfig.network))
            throw new Error('Address not valid in Bitcoin');

        return {utxos: await gethBTClocal.getUTXOs(address)};
    }catch (error){
        new handlerErr(error);
    }
}
async function getTxList(address){
    try{
        if(!Utils.isAddress(address, btcConfig.network))
            throw new Error('Address not valid in Bitcoin');
        return {txs: await gethBTClocal.getTxsByAddress(address)};
    }catch (error){
        new handlerErr(error);
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getTxList:              getTxList
};
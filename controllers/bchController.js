const gethBCHlocal = require(`${appRoot}/lib/bitcoin_cash/getBCHbitcoin_cash.js`);
const Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`);
const bchConfig = require(`${appRoot}/config/config.json`).BCHRpc;
const hanlerErr = require('../errors/HandlerErrors');

async function getBalance(address){
    const addr = Utils.isLegacyBCHAddress(address, bchConfig.network)
        || Utils.isBitpayBCHAddress(address, bchConfig.network)
        || Utils.isBCHAddress(address, bchConfig.network);
    if(!addr) throw new Error('address not valid in BCH');
    try {
        return {balance: await gethBCHlocal.getBalance(addr)};
    } catch (error) {
        new hanlerErr(error);
    }
}
async function sendRawTransaction(raw){
    try {
        return {txid: await gethBCHlocal.sendRawTransaction(raw)};
    } catch (error) {
        new hanlerErr(error);
    }
}
async function getUTXOs(address){
    const addr = Utils.isLegacyBCHAddress(address, bchConfig.network)
        || Utils.isBitpayBCHAddress(address, bchConfig.network)
        || Utils.isBCHAddress(address, bchConfig.network);
    if(!addr) throw new Error('address not valid in BCH');
    try{
        return {utxos: await gethBCHlocal.getUTXOs(addr)};
    }catch (error){
        new hanlerErr(error);
    }
}
async function getTxList(address){
    const addr = Utils.isLegacyBCHAddress(address, bchConfig.network)
        || Utils.isBitpayBCHAddress(address, bchConfig.network)
        || Utils.isBCHAddress(address, bchConfig.network);
    if(!addr) throw new Error('address not valid in BCH');
    try{
        return {txs: await gethBCHlocal.getTxsByAddress(addr)};
    }catch (error){
        new hanlerErr(error);
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getTxList:              getTxList
};
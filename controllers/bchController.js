const gethBCHlocal = require(`${appRoot}/lib/bitcoin_cash/getBCHbitcoin_cash.js`);
const Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`);
const bchConfig = require(`${appRoot}/config/config.json`).BCHRpc;
const handlerErr = require('../errors/HandlerErrors');
const bchTransaction = require(`${appRoot}/lib/mongodb/bchtransactions`);

async function getBalance(address){
    const addr = Utils.isLegacyBCHAddress(address, bchConfig.network)
        || Utils.isBitpayBCHAddress(address, bchConfig.network)
        || Utils.isBCHAddress(address, bchConfig.network);
    if(!addr) throw new Error('address not valid in BCH');
    try {
        return {balance: await gethBCHlocal.getBalance(addr)};
    } catch (error) {
        new handlerErr(error);
    }
}
async function sendRawTransaction(raw){
    try {
        const txid = await gethBCHlocal.sendRawTransaction(raw);
        await bchTransaction
            .saveTempTransactionToMongoDb(await getRawTransaction(txid));
        return {txid: txid};
    } catch (error) {
        new handlerErr(error);
    }
}
async function getRawTransaction(txid){
    if(!Utils.isString(txid))
        throw new Error('Transaction Id not valid');
    try {
        return await gethBCHlocal.getRawTransaction(txid);
    } catch (error) {
        new handlerErr(error);
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
        new handlerErr(error);
    }
}
async function getUTXOsP(address, page = 0) {
    try{
        const addr = Utils.isLegacyBCHAddress(address, bchConfig.network)
            || Utils.isBitpayBCHAddress(address, bchConfig.network)
            || Utils.isBCHAddress(address, bchConfig.network);
        if(!addr)
            throw new Error('Address not valid in Bitcoin');
        if(page<0)
            throw new Error('Page invalid');
        const result = await gethBCHlocal.getUTXOsP(addr, page, 50);
        return {
            pages: result[0],
            utxos: result[1]
        };
    }catch (error){
        new handlerErr(error);
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
        new handlerErr(error);
    }
}
async function getAllTxList(address, page = 0){
    try {
        const addr = Utils.isLegacyBCHAddress(address, bchConfig.network)
            || Utils.isBitpayBCHAddress(address, bchConfig.network)
            || Utils.isBCHAddress(address, bchConfig.network);
        if(!addr)
            throw new Error('Address not valid in BCH');
        if(page<0)
            throw new Error('Page invalid');
        const countTransaction = await bchTransaction.getCountTransaction(addr);
        const pages = Math.ceil(countTransaction/50);
        const pending = await bchTransaction.getPendingTransactions(addr);
        const transactionList = await bchTransaction.getAllTransactionList(addr, 50, page*50);

        return    {
            'pages': pages,
            'pending': pending,
            'transactions': transactionList
        }
    } catch (error) {
        new handlerErr(error);
    }
}

module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getUTXOsP:              getUTXOsP,
    getTxList:              getTxList,
    getRawTransaction:      getRawTransaction,
    getAllTxList:           getAllTxList
};
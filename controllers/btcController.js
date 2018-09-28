const gethBTClocal = require(`../lib/bitcoin/getBTCbitcoin.js`);
const Utils = require(`../lib/bitcoin/utilsBTC`);
const btcConfig = require(`../config/config.json`).BTCRpc;
const handlerErr = require(`../errors/HandlerErrors`);
const btcTransaction = require(`../lib/mongodb/btctransactions`);

async function getBalance(address){
    if(!Utils.isAddress(address, btcConfig.network))
         throw new Error('Address not valid in Bitcoin');
    try {
        return {balance: await gethBTClocal.getBalance(address)};
    } catch (error) {
        new handlerErr(error);
    }
}
async function getBalanceNew(address){
    if(!Utils.isAddress(address, btcConfig.network))
        throw new Error('Address not valid in Bitcoin');
    try {
        return {balance: await gethBTClocal.getBalanceNew(address)};
    } catch (error) {
        new handlerErr(error);
    }
}
async function sendRawTransaction(raw){
    try {
        const txid = await gethBTClocal.sendRawTransaction(raw);
        await btcTransaction
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
        return await gethBTClocal.getRawTransaction(txid);
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
async function getUTXOsP(address, page = 0) {
    try{
        if(!Utils.isAddress(address, btcConfig.network))
            throw new Error('Address not valid in Bitcoin');
        if(page<0)
            throw new Error('Page invalid');
        const result = await gethBTClocal.getUTXOsP(address, page, 50);
        return {
            pages: result[0],
            utxos: result[1]
        };
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
async function getAllTxList(address, page = 0){
    try {
        if(!Utils.isAddress(address, btcConfig.network))
            throw new Error('Address not valid in Bitcoin');
        if(page<0)
            throw new Error('Page invalid');
        const countTransaction = await btcTransaction.getCountTransaction(address);
        const pages = Math.ceil(countTransaction/50);
        const pending = await btcTransaction.getPendingTransactions(address);
        const transactionList = await btcTransaction.getAllTransactionList(address, 50, page*50);
        transactionList.map(tx => {
            return btcTransaction.calculateTransactionFee(tx._doc);
        });
        return    {
            'pages': pages,
            'pending': pending,
            'transactions': transactionList
        }
    } catch (error) {
        new handlerErr(error);
    }
}
async function getTxListByRand(address, count, from){
    try {
        if(!Utils.isAddress(address, btcConfig.network))
            throw new Error('Address not valid in Bitcoin');
        if(count<=0 || count>50)
            throw new Error('Count invalid');
        if(from<0)
            throw new Error('From invalid');
        
        const pending = await btcTransaction.getPendingTransactions(address);
        const transactionList = await btcTransaction.getAllTransactionList(address, count, from);
        transactionList.map(tx => {
            return btcTransaction.calculateTransactionFee(tx._doc);
        });
        return    {
            'pending': pending,
            'transactions': transactionList
        }
    } catch (error) {
        new handlerErr(error);
    }
}

module.exports = {
    getBalance:             getBalance,
    getBalanceNew:          getBalanceNew,
    sendRawTransaction:     sendRawTransaction,
    getTransactionById:     getRawTransaction,
    getUTXOs:               getUTXOs,
    getUTXOsP:              getUTXOsP,
    getTxList:              getTxList,
    getAllTxList:           getAllTxList,
    getTxListByRand:        getTxListByRand
};
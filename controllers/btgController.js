const gethBTGlocal = require(`${appRoot}/lib/bitcoin_gold/getBTGbitcoin_gold.js`);
const Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`);
const btgConfig = require(`${appRoot}/config/config.json`).BTGRpc;
const handlerErr = require(`${appRoot}/errors/HandlerErrors`);
const btgTransaction = require(`${appRoot}/lib/mongodb/btgtransactions`);

async function getBalance(address){
    if(!Utils.isAddress(address, btgConfig.network))
        throw new Error('Address not valid in Bitcoin');
    try {
        return {balance: await gethBTGlocal.getBalance(address)};
    } catch (error) {
        new handlerErr(error);
    }
}
async function getBalanceNew(address){
    if(!Utils.isAddress(address, btgConfig.network))
        throw new Error('Address not valid in Bitcoin');
    try {
        return {balance: await gethBTGlocal.getBalanceNew(address)};
    } catch (error) {
        new handlerErr(error);
    }
}
async function sendRawTransaction(raw){
    try {
        const txid = await gethBTGlocal.sendRawTransaction(raw);
        await btgTransaction
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
        return await gethBTGlocal.getRawTransaction(txid);
    } catch (error) {
        new handlerErr(error);
    }
}
async function getUTXOs(address){
    try{
        if(!Utils.isAddress(address, btgConfig.network))
            throw new Error('Address not valid in Bitcoin');

        return {utxos: await gethBTGlocal.getUTXOs(address)};
    }catch (error){
        new handlerErr(error);
    }
}
async function getUTXOsP(address, page = 0) {
    try{
        if(!Utils.isAddress(address, btgConfig.network))
            throw new Error('Address not valid in Bitcoin');
        if(page<0)
            throw new Error('Page invalid');
        const result = await gethBTGlocal.getUTXOsP(address, page, 50);
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
        if(!Utils.isAddress(address, btgConfig.network))
            throw new Error('Address not valid in Bitcoin');
        return {txs: await gethBTGlocal.getTxsByAddress(address)};
    }catch (error){
        new handlerErr(error);
    }
}
async function getAllTxList(address, page = 0){
    try {
        if(!Utils.isAddress(address, btgConfig.network))
            throw new Error('Address not valid in Bitcoin');
        if(page<0)
            throw new Error('Page invalid');
        const countTransaction = await btgTransaction.getCountTransaction(address);
        const pages = Math.ceil(countTransaction/50);
        const pending = await btgTransaction.getPendingTransactions(address);
        const transactionList = await btgTransaction.getAllTransactionList(address, 50, page*50);
        transactionList.map(tx => {
            return btgTransaction.calculateTransactionFee(tx._doc);
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
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getTransactionById:     getRawTransaction,
    getUTXOs:               getUTXOs,
    getUTXOsP:              getUTXOsP,
    getTxList:              getTxList,
    getAllTxList:           getAllTxList,
    getBalanceNew:          getBalanceNew
};
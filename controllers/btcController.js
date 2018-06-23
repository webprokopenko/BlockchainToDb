const gethBTClocal = require(`${appRoot}/lib/bitcoin/getBTCbitcoin.js`);
const Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`);
const btcConfig = require(`${appRoot}/config/config.json`).BTCRpc;
const handlerErr = require(`${appRoot}/errors/HandlerErrors`);
const btcTransaction = require(`${appRoot}/lib/mongodb/btctransactions`);

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
            throw new Error('Address not valid in Ethereum');
        if(page<0)
            throw new Error('Page invalid');
        const countTransaction = await btcTransaction.getCountTransaction(address);
        const pages = Math.ceil(countTransaction/50);
        const pending = await btcTransaction.getPendingTransactions(address);
        const transactionList = await btcTransaction.getAllTransactionList(address, 50, page*50);

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
    getAllTxList:           getAllTxList
};
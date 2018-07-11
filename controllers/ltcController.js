const gethLTClocal = require(`${appRoot}/lib/litecoin/getLTClitecoin.js`);
const Utils = require(`${appRoot}/lib/bitcoin/utilsBTC`);
const ltcConfig = require(`${appRoot}/config/config.json`).LTCRpc;
const handlerErr = require(`${appRoot}/errors/HandlerErrors`);
const ltcTransaction = require(`${appRoot}/lib/mongodb/ltctransactions`);

async function getBalance(address){
    if(!Utils.isAddress(address, ltcConfig.network))
        throw new Error('Address not valid in Litecoin');
    try {
        return {balance: await gethLTClocal.getBalance(address)};
    } catch (error) {
        new handlerErr(error);
    }
}
async function getBalanceNew(address){
    if(!Utils.isAddress(address, ltcConfig.network))
        throw new Error('Address not valid in Litecoin');
    try {
        return {balance: await gethLTClocal.getBalanceNew(address)};
    } catch (error) {
        new handlerErr(error);
    }
}
async function sendRawTransaction(raw){
    try {
        const txid = await gethLTClocal.sendRawTransaction(raw);
        await ltcTransaction
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
        return await gethLTClocal.getRawTransaction(txid);
    } catch (error) {
        new handlerErr(error);
    }
}
async function getUTXOs(address){
    try{
        if(!Utils.isAddress(address, ltcConfig.network))
            throw new Error('Address not valid in Bitcoin');

        return {utxos: await gethLTClocal.getUTXOs(address)};
    }catch (error){
        new handlerErr(error);
    }
}
async function getUTXOsP(address, page = 0) {
    try{
        if(!Utils.isAddress(address, ltcConfig.network))
            throw new Error('Address not valid in Litecoin');
        if(page<0)
            throw new Error('Page invalid');
        const result = await gethLTClocal.getUTXOsP(address, page, 50);
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
        if(!Utils.isAddress(address, ltcConfig.network))
            throw new Error('Address not valid in Litecoin');
        return {txs: await gethLTClocal.getTxsByAddress(address)};
    }catch (error){
        new handlerErr(error);
    }
}
async function getAllTxList(address, page = 0){
    try {
        if(!Utils.isAddress(address, ltcConfig.network))
            throw new Error('Address not valid in Litecoin');
        if(page<0)
            throw new Error('Page invalid');
        const countTransaction = await ltcTransaction.getCountTransaction(address);
        const pages = Math.ceil(countTransaction/50);
        const pending = await ltcTransaction.getPendingTransactions(address);
        const transactionList = await ltcTransaction.getAllTransactionList(address, 50, page*50);
        transactionList.map(tx => {
            return ltcTransaction.calculateTransactionFee(tx._doc);
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
const ethTransaction = require(`${appRoot}/lib/mongodb/ethtransactions`);
const gethETH = require(`${appRoot}/lib/ethereum/getETHRpc`);
const utils = require(`${appRoot}/lib/ethereum/utilsETH`);
const hanlerErr = require('../errors/HandlerErrors');

async function getTransactionList(address) {
    if(!utils.isAddress(address))
        throw new Error('Address not valid in Ethereum');
    try {
        let TraisactionIn = await ethTransaction.getTransactionlistIn(address);
        let TransactionOut = await ethTransaction.getTransactionlistOut(address);
        let TransactionPendingIn = await ethTransaction.getPendingInTxs(address);
        let TransactionPendingOut = await ethTransaction.getPendingOutTxs(address);
        return {
            'in': TraisactionIn,
            'out': TransactionOut,
            'pending_in': TransactionPendingIn,
            'pending_out': TransactionPendingOut
            };
    } catch (error) {
        new hanlerErr(error);
    }
}
async function getGasPrice() {
    try{
        let gasPrice = await gethETH.getGasPrice();
        return { 'gasPrice': utils.convertHexToInt(gasPrice), 'gasPriceHex': gasPrice }
    } catch(error){
        new hanlerErr(error);
    }
}
async function getGasLimit(){
    try{
        let block = await gethETH.getLatestBlock();
        return {'gasLimit':utils.convertHexToInt(block.gasLimit),'gasLimitHex':block.gasLimit}
    } catch(error){
        new hanlerErr(error);
    }
}
async function getPriceLimit(){
    try{
        let gasLimit = await this.getGasLimit();
        let gasPrice = await this.getGasPrice();
        return {'gasLimit':gasLimit.gasLimit,'gasLimitHex':gasLimit.gasLimitHex, 'gasPrice':gasPrice.gasPrice, 'gasPriceHex':gasPrice.gasPriceHex};
    } catch(error){
        new hanlerErr(error);
    }
}
async function getBalance(address){
    if(!utils.isAddress(address))
        throw new Error('address not valid in ETH');
    try {
        let balance = await gethETH.getBalance(address);
        return {'balance':utils.convertHexToInt(balance)}
    } catch (error) {
        new hanlerErr(error);
    }
}
async function getTransactionCount(address){
    if(!utils.isAddress(address))
        throw new Error('address not valid in ETH');
    try {
        let transactionCount = await gethETH.getTransactionCount(address);
        return {'TransactionCount':utils.convertHexToInt(transactionCount)}    
    } catch (error) {
        new hanlerErr(error);
    }    
}
async function sendRawTransaction(rawTransaction){
    try{
        let transactionHash = await gethETH.sendRawTransaction(rawTransaction);
        await ethTransaction
            .saveTempTransaction(await getTransactionFromHash(transactionHash));
        return {hash: transactionHash};
    } catch (error){
        new hanlerErr(error);
    }
}
async function getTransactionFromHash(txHash) {
    try {
        if(!utils.isHash(txHash)) return {error: 'Wrong hash.'};
        let txData = await gethETH.getTransactionFromHash(txHash);    
        txData.blockNumber = txData.blockNumber ?
            utils.convertHexToInt(txData.blockNumber):
            0;
        txData.transactionIndex = utils.convertHexToInt(txData.transactionIndex);
        txData.value = utils.convertHexToInt(txData.value);
        txData.gas = utils.convertHexToInt(txData.gas);
        txData.gasPrice = utils.convertHexToInt(txData.gasPrice);

        return txData
    } catch (error) {
        new hanlerErr(error);
    }
}
async function getTokenBalance(contractAddress, address) {
    try{
        if(!utils.isAddress(contractAddress)) throw new Error ('Wrong contract address.');
        if(!utils.isAddress(address)) throw new Error('Wrong address.');
        const decimals = await gethETH.getContractDecimals(contractAddress);
        const tokens = await gethETH.getTokens(contractAddress, address);
        return {'tokens': tokens.dividedBy(10 ** decimals.toNumber())};
    } catch(error){
        new hanlerErr(error);
    }
}
module.exports = {
    getTransactionlist:     getTransactionList,
    getGasPrice:            getGasPrice,
    getGasLimit:            getGasLimit,
    getPriceLimit:          getPriceLimit,
    getBalance:             getBalance,
    getTransactionCount:    getTransactionCount,
    sendRawTransaction:     sendRawTransaction,
    getTransactionFromHash: getTransactionFromHash,
    getTokenBalance:        getTokenBalance
};
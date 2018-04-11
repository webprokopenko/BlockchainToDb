const ethTransaction = require(`${appRoot}/lib/mongodb/ethtransactions`);
const gethETH = require(`${appRoot}/lib/ethereum/getETHRpc`);
const utils = require(`${appRoot}/lib/ethereum/utilsETH`);

//Intel logger setup
const intel = require('intel');
const EthError = intel.getLogger('EthError');
EthError.setLevel(EthError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/eth/error.log`));


async function getTransactionList(address) {
    if(!utils.isAddress(address))
        throw new Error('Address not valid in Ethereum');
    try {
        let TraisactionIn = await ethTransaction.getTransactionlistIn(address);
        let TransactionOut = await ethTransaction.getTransactionlistOut(address);
        return { 'in': TraisactionIn, 'out': TransactionOut };    
    } catch (error) {
        EthError.error(`${new Date()} Error: getTransactionList: ${error}`);
        throw new Error('Service error');
    }
}
async function getGasPrice() {
    try{
        let gasPrice = await gethETH.getGasPrice();
        return { 'gasPrice': utils.convertHexToInt(gasPrice), 'gasPriceHex': gasPrice }
    } catch(error){
        EthError.error(`${new Date()} Error: getGasPrice: ${error}`);
        throw new Error('Service error');
    }
}
async function getGasLimit(){
    try{
        let block = await gethETH.getLatestBlock();
        return {'gasLimit':utils.convertHexToInt(block.gasLimit),'gasLimitHex':block.gasLimit}
    } catch(error){
        EthError.error(`${new Date()} Error: getGasLimit: ${error}`);
        throw new Error('Service error');
    }
}
async function getPriceLimit(){
    try{
        let gasLimit = await this.getGasLimit();
        let gasPrice = await this.getGasPrice();
        return {'gasLimit':gasLimit.gasLimit,'gasLimitHex':gasLimit.gasLimitHex, 'gasPrice':gasPrice.gasPrice, 'gasPriceHex':gasPrice.gasPriceHex};
    } catch(error){
        EthError.error(`${new Date()} Error: getPriceLimit: ${error}`);
        throw new Error('Service error');
    }
}
async function getBalance(address){
    if(!utils.isAddress(address))
        throw new Error('address not valid in ETH');
    try {
        let balance = await gethETH.getBalance(address);
        return {'balance':utils.convertHexToInt(balance)}
    } catch (error) {
        EthError.error(`${new Date()} Error: getBalance: ${error}`);
        throw new Error('Service error');
    }
}
async function getTransactionCount(address){
    if(!utils.isAddress(address))
        throw new Error('address not valid in ETH');
    try {
        let transactionCount = await gethETH.getTransactionCount(address);
        return {'TransactionCount':utils.convertHexToInt(transactionCount)}    
    } catch (error) {
        EthError.error(`${new Date()} Error: getTransactionCount: ${error}`);
        throw new Error('Service error');
    }    
}
async function sendRawTransaction(rawTransaction){
    try{
        let transactionHash = await gethETH.sendRawTransaction(rawTransaction);
        return {transactionHash}
    } catch (error){
        EthError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
        throw new Error('Service error');
    }
}
async function getTransactionFromHash(txHash){
    try {
        let txData = await gethETH.getTransactionFromHash(txHash);    
        txData.blockNumber = utils.convertHexToInt(txData.blockNumber);
        txData.transactionIndex = utils.convertHexToInt(txData.transactionIndex);
        txData.value = utils.convertHexToInt(txData.value);
        txData.gas = utils.convertHexToInt(txData.gas);
        txData.gasPrice = utils.convertHexToInt(txData.gasPrice);

        return txData
    } catch (error) {
        EthError.error(`${new Date()} Error: getTransactionFromHash: ${error}`);
        throw new Error('Service error');
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
    getTransactionFromHash: getTransactionFromHash
};
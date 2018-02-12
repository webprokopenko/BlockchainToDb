const ethTransaction = require(`${appRoot}/lib/mongodb/ethtransactions`);
const gethETH = require(`${appRoot}/lib/ethereum/getETHRpc`);
const utils = require(`${appRoot}/lib/ethereum/utilsETH`);

async function getTransactionList(address) {
    if(!utils.isAddress(address))
        throw new Error('address not valid in ETH');
    try {
        let TraisactionIn = await ethTransaction.getTransactionlistIn(address);
        let TransactionOut = await ethTransaction.getTransactionlistOut(address);
        return { 'in': TraisactionIn, 'out': TransactionOut };    
    } catch (error) {
        console.error(error);
    }
    
}
async function getGasPrice() {
    let gasPrice = await gethETH.getGasPrice();
    return { 'gasPrice': utils.convertHexToInt(gasPrice), 'gasPriceHex': gasPrice }
}
async function getGasLimit(){
    let block = await gethETH.getLatestBlock();

    return {'gasLimit':utils.convertHexToInt(block.gasLimit),'gasLimitHex':block.gasLimit}
}
async function getPriceLimit(){
    gasLimit = await this.getGasLimit();
    gasPrice = await this.getGasPrice();

    return {'gasLimit':gasLimit.gasLimit,'gasLimitHex':gasLimit.gasLimitHex, 'gasPrice':gasPrice.gasPrice, 'gasPriceHex':gasPrice.gasPriceHex};
}
async function getBalance(address){
    if(!utils.isAddress(address))
        throw new Error('address not valid in ETH');
    try {
        balance = await gethETH.getBalance(address);
        return {'balance':utils.convertHexToInt(balance)}
    } catch (error) {
        console.error(error);
    }
   
}
async function getTransactionCount(address){
    if(!utils.isAddress(address))
        throw new Error('address not valid in ETH');
    try {
        transactionCount = await gethETH.getTransactionCount(address);
        return {'TransactionCount':utils.convertHexToInt(transactionCount)}    
    } catch (error) {
        console.error(error);
    }    
    
}
async function sendRawTransaction(rawTransaction){
    transactionHash = await gethETH.sendRawTransaction(rawTransaction);
    return {transactionHash}
}

module.exports = {
    getTransactionlist:     getTransactionList,
    getGasPrice:            getGasPrice,
    getGasLimit:            getGasLimit,
    getPriceLimit:          getPriceLimit,
    getBalance:             getBalance,
    getTransactionCount:    getTransactionCount,
    sendRawTransaction:     sendRawTransaction
}
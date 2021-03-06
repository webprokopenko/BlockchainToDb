const ethTransaction = require(`../lib/mongodb/ethtransactions`);
const gethETH = require(`../lib/ethereum/getETHRpc`);
const utils = require(`../lib/ethereum/utilsETH`);
const handlerErr = require('../errors/HandlerErrors');

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
        new handlerErr(error);
    }
}
async function getTransactionListPending(address) {
    if(!utils.isAddress(address))
        throw new Error('Address not valid in Ethereum');
    try {
        let TransactionPending = await ethTransaction.getPendingTxs(address);
        let Transactions = await ethTransaction.getAllTransactionList(address, 50, 0);
        const countTransaction = await ethTransaction.getCountTransaction(address);
        const pages = Math.ceil(countTransaction/50);
        return {
            'pages': pages,
            'pending': TransactionPending,
            'transactions': Transactions
        };
    } catch (error) {
        new handlerErr(error);
    }
}
async function getAllTransactionList(address, page=0){
    try {
        if(!utils.isAddress(address))
            throw new Error('Address not valid in Ethereum');
        if(page<0)
            throw new Error('Page invalid');
        
            
        const countTransaction = await ethTransaction.getCountTransaction(address);
        const pages = Math.ceil(countTransaction/50);

        const transactionList = await ethTransaction.getAllTransactionList(address, 50, page*50);
        
        return    {
            'pages': pages,
            'transactions': transactionList
        }
    } catch (error) {
        new handlerErr(error);
    }
}
async function getGasPrice() {
    try{
        let gasPrice = await gethETH.getGasPrice();
        return { 'gasPrice': utils.convertHexToInt(gasPrice), 'gasPriceHex': gasPrice }
    } catch(error){
        new handlerErr(error);
    }
}
async function getGasLimit(){
    try{
        let block = await gethETH.getLatestBlock();
        return {'gasLimit':utils.convertHexToInt(block.gasLimit),'gasLimitHex':block.gasLimit}
    } catch(error){
        new handlerErr(error);
    }
}
async function getPriceLimit(){
    try{
        let gasLimit = await this.getGasLimit();
        let gasPrice = await this.getGasPrice();
        return {'gasLimit':gasLimit.gasLimit,'gasLimitHex':gasLimit.gasLimitHex, 'gasPrice':gasPrice.gasPrice, 'gasPriceHex':gasPrice.gasPriceHex};
    } catch(error){
        new handlerErr(error);
    }
}
async function getBalance(address){
    if(!utils.isAddress(address))
        throw new Error('address not valid in ETH');
    try {
        let balance = await gethETH.getBalance(address);
        return {'balance':utils.convertHexToInt(balance)}
    } catch (error) {
        new handlerErr(error);
    }
}
async function getTransactionCount(address){
    if(!utils.isAddress(address))
        throw new Error('address not valid in ETH');
    try {
        let transactionCount = await gethETH.getTransactionCount(address);
        return {'TransactionCount':utils.convertHexToInt(transactionCount)}    
    } catch (error) {
        new handlerErr(error);
    }    
}
async function sendRawTransaction(rawTransaction){
    try{
        let transactionHash = await gethETH.sendRawTransaction(rawTransaction);
        await ethTransaction
            .saveTempTransaction(await getTransactionFromHash(transactionHash));
        return {hash: transactionHash};
    } catch (error){
        new handlerErr(error);
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
        new handlerErr(error);
    }
}
async function getTokenBalance(contractAddress, address) {
    try{
        if(!utils.isAddress(contractAddress)) throw new Error ('Wrong contract.');
        if(!utils.isAddress(address)) throw new Error('Wrong address.');
        const decimals = await gethETH.getContractDecimals(contractAddress);
        const tokens = await gethETH.getTokens(contractAddress, address);
        return {'tokens': tokens.dividedBy(10 ** decimals.toNumber())};
    } catch(error){
        new handlerErr(error);
    }
}
async function getContractTransfers(contractAddress, address) {
    try{
        if(!utils.isAddress(contractAddress)) throw new Error ('Wrong contract address.');
        if(!utils.isAddress(address)) throw new Error('Wrong address.');
        const transfers = await ethTransaction.getContractTransfers(contractAddress, address);
        return {'transfers': transfers};
    } catch(error){
        new handlerErr(error);
    }
}
async function getContractTransfersPage(contractAddress, address, page = 0) {
    try{
        if(!utils.isAddress(contractAddress)) throw new Error ('Wrong contract address.');
        if(!utils.isAddress(address)) throw new Error('Wrong address.');
        if(page<0) throw new Error('Page invalid');

        const countTransaction = await ethTransaction.getCountTransaction(address);
        const pages = Math.floor(countTransaction/50);
        const transfers = await ethTransaction.getContractTransfers(contractAddress, address, 50, page * 50);
        return {
            pages: pages,
            transfers: transfers
        };
    } catch(error){
        new handlerErr(error);
    }
}

module.exports = {
    getTransactionList:         getTransactionList,
    getTransactionListPending:  getTransactionListPending,
    getGasPrice:                getGasPrice,
    getGasLimit:                getGasLimit,
    getPriceLimit:              getPriceLimit,
    getBalance:                 getBalance,
    getTransactionCount:        getTransactionCount,
    sendRawTransaction:         sendRawTransaction,
    getTransactionFromHash:     getTransactionFromHash,
    getTokenBalance:            getTokenBalance,
    getAllTransactionList:      getAllTransactionList,
    getContractTransfers:       getContractTransfers,
    getContractTransfersPage:   getContractTransfersPage
};
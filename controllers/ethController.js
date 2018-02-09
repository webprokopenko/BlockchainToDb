const ethTransaction = require(`${appRoot}/lib/mongodb/ethtransactions`);
const gethETH = require(`${appRoot}/lib/ethereum/getETHRpc`);

async function getTransactionList(address) {
    let TraisactionIn = await ethTransaction.getTransactionlistIn(address);
    let TransactionOut = await ethTransaction.getTransactionlistOut(address);
    return { 'in': TraisactionIn, 'out': TransactionOut };
}
async function getGasPrice() {
    let gasPrice = await gethETH.getGasPrice();
    return gasPrice
}

module.exports = {
    getTransactionlist: getTransactionList,
    getGasPrice: getGasPrice
}
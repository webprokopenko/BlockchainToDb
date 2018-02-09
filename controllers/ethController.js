const ethTransaction = require(`${appRoot}/lib/mongodb/ethtransactions`);
const gethETH = require(`${appRoot}/lib/ethereum/getETHRpc`);

function convertNumberToHex(num) {
    return `0x${num.toString(16)}`
}
function convertHexToInt(hex) {
    return `${parseInt(hex, 16)}`
}


async function getTransactionList(address) {
    let TraisactionIn = await ethTransaction.getTransactionlistIn(address);
    let TransactionOut = await ethTransaction.getTransactionlistOut(address);
    return { 'in': TraisactionIn, 'out': TransactionOut };
}
async function getGasPrice() {
    let gasPrice = await gethETH.getGasPrice();
    return gasPrice
}
async function getGasLimit(){
    let block = await gethETH.getLatestBlock();

    return {'gasLimit':convertHexToInt(block.gasLimit),'gasLimitHex':block.gasLimit}
}

module.exports = {
    getTransactionlist: getTransactionList,
    getGasPrice: getGasPrice,
    getGasLimit: getGasLimit
}
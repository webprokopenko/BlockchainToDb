const ethTransaction = require('../lib/mongodb/ethtransactions');
const gethETH = require('../lib/ethereum/getETHRpc');

async function getTransactionList(address){
    try {
        let     TraisactionIn  = await ethTransaction.getTransactionlistIn(address);
        let     TransactionOut = await ethTransaction.getTransactionlistOut(address);
        return {'in':TraisactionIn, 'out':TransactionOut};
    } catch (error) {
        console.log('Error getTransaction List ' + error)
    }
}
async function getGasPrice(){
    let gasPrice = await gethETH.getGasPrice();
    return gasPrice
}

 module.exports = {
     getTransactionlist: getTransactionList,
     getGasPrice:getGasPrice
}
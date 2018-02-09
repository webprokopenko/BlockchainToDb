const ethTransaction = require('../lib/mongodb/ethtransactions');

async function getTransactionList(address){
    try {
        let     TraisactionIn  = await ethTransaction.getTransactionlistIn(address);
        let     TransactionOut = await ethTransaction.getTransactionlistOut(address);
        return {'in':TraisactionIn, 'out':TransactionOut};
    } catch (error) {
        console.log('Error getTransaction List ' + error)
    }
}

 module.exports = {
     getTransactionlist: getTransactionList
}
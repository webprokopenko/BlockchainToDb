const ethTransaction = require('../lib/mongodb/ethtransactions');

async function getTransactionList(address){
    try {
        let listIn = await ethTransaction.getTransactionlistIn(address);
        let listOut = await ethTransaction.getTransactionlistOut(address);
        console.log(listIn);
        console.log(listOut);
        return {listIn, listOut};
    } catch (error) {
        console.log('Error getTransaction List ' + error)
    }
}

 module.exports = {
     getTransactionlist: getTransactionList
}
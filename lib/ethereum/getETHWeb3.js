const Web3 = require('web3');
var BigNumber = require('bignumber.js');
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

module.exports.web3 = function (req, res) {
    web3.eth.getBlock(100000, function (error, result) {
        if (!error) {
            console.log(result.transactions);
            var transaction = web3.eth.getTransaction(result);
            console.log(transaction);
        }

        else
            console.error(error);
    });

};

function w3getHashTransactionFromBlock(blockNumber) {
    return new Promise((resolve, reject) => {
        web3.eth.getBlock(blockNumber, function (error, result) {
            (!error) ? resolve(result) : reject(error);
        });
    });
}
function w3getInfoTransactionFromHash(transactionHash) {
    return new Promise((resolve, reject) => {
        web3.eth.getTransaction(transactionHash, (err, result) => {
            (!err) ? resolve(result) : reject(err);
        });
    });
}
const formBlockWithTransaction = async (blockNumber) => {
    try {
        block = await w3getHashTransactionFromBlock(blockNumber);
        blockWithTransaction = Object.assign({}, block);
        blockWithTransaction.fulltransaction = [];

        if (blockWithTransaction.transactions) {
            await Promise.all(blockWithTransaction.transactions.map(async (item, i) => {
                blockWithTransaction['fulltransaction'][i] = await w3getInfoTransactionFromHash(item);
            }));
            blockWithTransaction.fulltransaction.forEach(element => {
                console.log(new BigNumber(element.value).toNumber());
            });
        }
    } catch (e) {
        console.log(e);
    }
}
formBlockWithTransaction(2433608);
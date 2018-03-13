const bitcoin = require('bitcoin');
const clientBtc = new bitcoin.Client(require(`../../config/config.json`).BTCRpc);

function getBalance(addr){
    return new Promise((resolve, reject) => {
        clientBtc.getBalance(addr, 6, function(err, balance, resHeaders) {    
            if(err)
                return reject(new Error(`getBTCbitcoin getBalance error ${err}`));

            resolve(balance);
          });
    });
} 
module.exports = {
    getBalance:             getBalance,
}  

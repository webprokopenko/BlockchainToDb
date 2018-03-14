const bitcoin = require('bitcoin');
const clientBtc = new bitcoin.Client(require(`../../config/config.json`).BTCRpc);

function getBalance(addr){
    return new Promise((resolve, reject) => {
        clientBtc.getBalance(addr, 6, function(err, balance) {    
            if(err)
                return reject(new Error(`getBTCbitcoin getBalance error ${err}`));

            resolve(balance);
          });
    });
}
function getBalanceCmd(addr){
    return new Promise((resolve, reject) => {
    clientBtc.cmd('getbalance', addr, 6, function(err, balance){
        if (err) return console.log(err);
        resolve(balance);
      });
    });  
}
function sendRawTransacitonCmd(raw){
    return new Promise((resolve, reject) => {
    clientBtc.cmd('sendrawtransaction', function(err, res){
        if (err) return console.log(err);
        console.log('Result from raw transaction');
        resolve(res);
      });
    });  
} 
module.exports = {
    getBalance:             getBalance,
    getBalanceCmd:          getBalanceCmd,
    sendRawTransacitonCmd:  sendRawTransacitonCmd
}  

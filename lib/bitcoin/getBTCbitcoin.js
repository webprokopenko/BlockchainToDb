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
        if (err) 
            return reject(new Error(`getBTCbitcoin getBalanceCmd error ${err}`));
        resolve(balance);
      });
    });  
}
function sendRawTransacitonCmd(raw){
    return new Promise((resolve, reject) => {
    clientBtc.cmd('sendrawtransaction', function(err, res){
        if (err) return console.log(err);
        resolve(res);
      });
    });  
}
function listUnspentCmd(addr){
    return new Promise((resolve, reject) => {
        clientBtc.cmd('listUnspent', 1, 1, addr, function(err, res){
            if (err) return console.log(err);
            resolve(res);
        });
    });
}
function gettxoutCmd(txid){
    return new Promise((resolve, reject) => {
        clientBtc.cmd('gettxout', 1, false, txid, function(err, res){
            if (err) return console.log(err);
            resolve(res);
        });
    });
} 
module.exports = {
    getBalance:             getBalance,
    getBalanceCmd:          getBalanceCmd,
    sendRawTransacitonCmd:  sendRawTransacitonCmd,
    listUnspentCmd:         listUnspentCmd,
    gettxoutCmd:            gettxoutCmd
}  

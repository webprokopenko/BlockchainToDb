var Insight = require('bitcore-explorers').Insight;
var insight = new Insight('testnet');


function gettxout(txid){
    return new Promise((resolve, reject) => {
        insight.getUnspentUtxos(addr, function(err, utxos) {
            if (err) {
              reject(err);
            } else {
                resolve(utxos);
            }
          });
    });
}
function getInfo(addr){
    return new Promise((resolve, reject) => {
        insight.address(addr, function(err, utxos) {
            if (err) {
              reject(err);
            } else {
                resolve(utxos);
            }
          });
    });
}
module.exports = {
    gettxout:            gettxout,
    getInfo:          getInfo
}  

    
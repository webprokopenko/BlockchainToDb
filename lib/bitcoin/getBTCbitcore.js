var Insight = require('bitcore-explorers').Insight;
var insight = new Insight('testnet');
var XHR = require('xmlhttprequest').XMLHttpRequest;
var b64 = require('base-64');


function gettxout(addr){
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
function getBalance(addr) {
    return new Promise((resolve, reject) =>{
        const params = {
            method: 'get',
            url: 'https://test-'
            + 'insight.bitpay.com/api/addr/' + addr + '/balance'
        };
        _sendAPI(params)
            .then(resp => {
                return resolve(resp * 1e8);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
function getUTXOs(addr) {
    return new Promise((resolve, reject) =>{
        const params = {
            method: 'get',
            url: 'https://test-'
            + 'insight.bitpay.com/api/addr/' + addr + '/utxo'
        };
        _sendAPI(params)
            .then(utoxs => {
                return resolve(utoxs);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
function getTXlist(addr) {
    return new Promise((resolve, reject) =>{
        const params = {
            method: 'get',
            url: 'https://test-'
            + 'insight.bitpay.com/api/addrs/' + addr + '/txs?from=0&to=50'
        };
        _sendAPI(params)
            .then(txs => {
                return resolve(JSON.parse(txs));
            })
            .catch(err => {
                return reject(err);
            })
    });
}
function sendRawTx(hex) {
    return new Promise((resolve, reject) =>{
        const params = {
            method: 'post',
            url: 'https://test-'
            + 'insight.bitpay.com/api/tx/send',
            data: {
                rawtx: hex
            }
        };
        _sendAPI(params)
            .then(txid => {
                return resolve(txid);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
function sendRawTxLocal(hex) {
    return new Promise((resolve, reject) =>{
        const params = {
            method: 'post',
            url: 'http://localhost:18332',
            data: {
                "jsonrpc": "1.0",
                "id":"12",
                "method": "sendrawtransaction",
                "params": [hex]
            },
            headers: [
                {
                    key: 'Content-Type',
                    value: 'application/json'
                },
                {
                    key: 'Authorization',
                    value: 'Basic ' + b64.encode('bitcoin:bit4CoinpasswOr6d')
                }
            ]
        };
        _sendAPI(params)
            .then(txid => {
                return resolve(txid);
            })
            .catch(err => {
                return reject(err);
            })
    });
}
function _sendAPI(data) {
  return new Promise((resolve, reject) => {
      try {
          const xhr = new XHR();
          xhr.open(data.method, data.url);
          if(data.headers) for(let i = 0;i < data.headers.length;i++)
              xhr.setRequestHeader(data.headers[i].key,data.headers[i].value);
          xhr.onload = () => {
              return resolve(xhr.responseText);
          };
          xhr.onerror = (err) => {
              return reject(err);
          };
          xhr.send(data.data?JSON.stringify(data.data):null);
      } catch (err) {
          return reject(err);
      }
  })
}
module.exports = {
    gettxout:            gettxout,
    getInfo:          getInfo,
    getBalance: getBalance,
    getUTXOs: getUTXOs,
    getTXlist: getTXlist,
    sendRawTx: sendRawTx,
    sendRawTxLocal: sendRawTxLocal
};

    
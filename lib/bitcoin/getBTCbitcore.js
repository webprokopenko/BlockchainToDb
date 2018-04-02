const Insight = require('bitcore-explorers').Insight,
    insight = new Insight('testnet'),
    XHR = require('xmlhttprequest').XMLHttpRequest,
    network = 'test-';

function getBalance(addr) {
    return new Promise((resolve, reject) =>{
        const params = {
            method: 'get',
            url: 'https://' + network
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
            url: 'https://' + network
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
function getTxList(addr, from = 0, to = 50) {
    return new Promise((resolve, reject) =>{
        const params = {
            method: 'get',
            url: 'https://' + network
            + 'insight.bitpay.com/api/addrs/' + addr + '/txs?from=' + from + '&to=' + to
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
function getTxById(txid) {
    return new Promise((resolve, reject) =>{
        const params = {
            method: 'get',
            url: 'https://' + network
            + 'insight.bitpay.com/api/tx/' + txid
        };
        _sendAPI(params)
            .then(tx => {
                return resolve(JSON.parse(tx));
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
    getTxById: getTxById,
    getBalance: getBalance,
    getUTXOs: getUTXOs,
    getTxList: getTxList
};

    
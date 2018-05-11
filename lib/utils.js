const b64 = require('base-64');
const XHR = require('xmlhttprequest').XMLHttpRequest;

const sendRPC = function (method, config, params = [], prefix = '') {
    return new Promise((resolve, reject) => {
        try {
            const data = _rpcParams(method, prefix, params, config);
            const xhr = new XHR();
            xhr.open(data.method, data.url);
            while(data.headers.length) {
                xhr.setRequestHeader(data.headers[0].key, data.headers[0].value);
                data.headers.shift();
            }
            xhr.onload = () => {
                return resolve(xhr.responseText);
            };
            xhr.onerror = () => {
                return reject(xhr.responseText);
            };
            xhr.send(data.data?JSON.stringify(data.data):null);
        } catch (err) {
            return reject(err);
        }
    })
};
function _rpcParams(method, prefix, params, config) {
    const headers = [{
        key: 'Content-Type',
        value: 'application/json'
    }];
    if(config.user && config.pass) headers.push({
        key: 'Authorization',
        value: 'Basic ' + b64.encode(config.user + ':' + config.pass)
    });
    return {
        method: 'post',
        url: 'http://' + config.host + ':' + config.port + '/' + prefix,
        data: {
            'jsonrpc': config.rpc_vesion || '2.0',
            'id':'12',
            'method': method,
            'params': params
        },
        headers: headers
    };
}
module.exports = {
    sendRPC:     sendRPC
};
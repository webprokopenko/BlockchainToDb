/**
 * @file utilsETH.js
 */

const BigNumber = require('../../node_modules/bignumber.js/bignumber');
const CryptoJS = require('crypto-js');
const _sha3 = require('crypto-js/sha3');
const b64 = require('base-64');
const XHR = require('xmlhttprequest').XMLHttpRequest;
const fs = require('fs');

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
                return reject({code: 32000, message: xhr.responseText});
            };
            xhr.send(data.data?JSON.stringify(data.data):null);
        } catch (err) {
            return reject(err);
        }
    })
};
const sendData = function (data) {
    return new Promise((resolve, reject) => {
        try {
            const xhr = new XHR();
            xhr.open(data.method, data.url);
            data.headers = data.headers || [{
                key: 'Content-Type',
                value: 'application/json'
            }];
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


/**
 * Convert Number to Hes String
 * @method sha3
 * @param {String} value, required
 * @param {Object} options, optional
 * @return {string}
 */
const sha3 = function (value, options) {
    if (options && options.encoding === 'hex') {
        if (value.length > 2 && value.substr(0, 2) === '0x') {
            value = value.substr(2);
        }
        value = CryptoJS.enc.Hex.parse(value);
    }

    return _sha3(value, {
        outputLength: 256
    }).toString();
};
/**
 * Convert Number to Hes String
 * @method convertNumberToHex
 * @param {number} num
 * @return {string}
 */
const convertNumberToHex = function (num) {
    return `0x${num.toString(16)}`
};
/**
 * @method convertHexToInt
 * @param {string} hex
 * @return {number}
 */
const convertHexToInt = function (hex) {
    return `${parseInt(hex, 16)}`
};
/**
 * Returns true if object is BigNumber, otherwise false
 *
 * @method isBigNumber
 * @param {Object} object
 * @return {Boolean}
 */
const isBigNumber = function (object) {
    return object instanceof BigNumber ||
        (object && object.constructor && object.constructor.name === 'BigNumber');
};
/**
 * Takes an input and transforms it into an bignumber
 *
 * @method toBigNumber
 * @param {Number|String|BigNumber} number, string, HEX string or BigNumber
 * @return {BigNumber} BigNumber
 */
const toBigNumber = function(number) {
    /*jshint maxcomplexity:5 */
    number = number || 0;
    if (isBigNumber(number))
        return number;

    if (isString(number) && (number.indexOf('0x') === 0 || number.indexOf('-0x') === 0)) {
        return new BigNumber(number.replace('0x',''), 16);
    }

    return new BigNumber(number.toString(10), 10);
};
/**
 * Returns true if object is string, otherwise false
 *
 * @method isString
 * @param {Object} object
 * @return {Boolean}
 */
const isString = function (object) {
    return typeof object === 'string' ||
        (object && object.constructor && object.constructor.name === 'String');
};

/**
 * Returns true if object is function, otherwise false
 *
 * @method isFunction
 * @param {Object} object
 * @return {Boolean}
 */
const isFunction = function (object) {
    return typeof object === 'function';
};

/**
 * Returns true if object is Objet, otherwise false
 *
 * @method isObject
 * @param {Object} object
 * @return {Boolean}
 */
const isObject = function (object) {
    return object !== null && !(object instanceof Array) && typeof object === 'object';
};

/**
 * Returns true if object is boolean, otherwise false
 *
 * @method isBoolean
 * @param {Object} object
 * @return {Boolean}
 */
const isBoolean = function (object) {
    return typeof object === 'boolean';
};

/**
 * Returns true if object is array, otherwise false
 *
 * @method isArray
 * @param {Object} object
 * @return {Boolean}
 */
const isArray = function (object) {
    return object instanceof Array;
};
/**
 * Returns true if given string is valid json object
 *
 * @method isJson
 * @param {String} str
 * @return {Boolean}
 */
const isJson = function (str) {
    try {
        return !!JSON.parse(str);
    } catch (e) {
        return false;
    }
};
const fileExists = function (filepath) {
    let flag = true;
    try{
        fs.existsSync(filepath);
    }catch(e){
        flag = false;
    }
    return flag;
};
module.exports = {
    sendRPC:            sendRPC,
    sendData:           sendData,
    convertNumberToHex: convertNumberToHex,
    convertHexToInt:    convertHexToInt,
    toBigNumber:        toBigNumber,
    isJson:             isJson,
    isString:           isString,
    isBoolean:          isBoolean,
    isArray:            isArray,
    isObject:           isObject,
    isFunction:         isFunction,
    isBigNumber:        isBigNumber,
    sha3:               sha3,
    fileExists:         fileExists
}
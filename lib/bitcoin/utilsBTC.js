const bitcoinJS = require('bitcoinjs-lib');
const zcore = require('zcash-bitcore-lib');
const bitcash = require('bitcoincashjs');
const bitgold = require('bgoldjs-lib');

/**
 * Convert Number to Hes String
 * @method convertNumberToHex
 * @param {number} num
 * @return {string}
 */
const convertNumberToHex = function (num) {
    return `0x${num.toString(16)}`
};
const isZAddress = function (address, network) {
    try {
        const addr = new zcore.Address(address);
        return true;
    } catch (err) {
        return false;
    }
};
const isAddressBTG = function (address, network) {
    try {
        // bitgold.address.toOutputScript(address, network === 'testnet' ?
        // bitgold.networks.testnet : null);
        return true;
    } catch (err) {
        return false;
    }
};
const isAddress = function (address, network) {
    try {
        bitcoinJS.address.toOutputScript(address, network === 'testnet' ?
            bitcoinJS.networks.testnet : null);
        return true;
    } catch (err) {
        return false;
    }
};
const isLegacyBCHAddress = function (address, network) {
    try {
        const addr = bitcash.Address.fromString(address,
            network, 'pubkeyhash');
        return addr.toString(bitcash.Address.CashAddrFormat).split(':')[1];
    } catch (err) {
        return false;
    }
};
const isBitpayBCHAddress = function (address, network) {
    try {
        const addr = bitcash.Address.fromString(address,
            network, 'pubkeyhash', bitcash.Address.BitpayFormat);
        return addr.toString(bitcash.Address.CashAddrFormat).split(':')[1];
    } catch (err) {
        return false;
    }
};
const isBCHAddress = function (address, network) {
    try {
        const addr = bitcash.Address.fromString(address,
            network, 'pubkeyhash', bitcash.Address.CashAddrFormat);
        return addr.toString(bitcash.Address.CashAddrFormat).split(':')[1];
    } catch (err) {
        return false;
    }
};
const fromCashAddr = function(cashAddr, network) {
    try {
        const addr = bitcash.Address.fromString(cashAddr,
            network, 'pubkeyhash', bitcash.Address.CashAddrFormat);
        return addr.toString();
    } catch (err) {
        return false;
    }
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
module.exports = {
    convertNumberToHex:     convertNumberToHex,
    isAddressBTG:           isAddressBTG,
    isAddress:              isAddress,
    isZAddress:             isZAddress,
    isLegacyBCHAddress:     isLegacyBCHAddress,
    isBitpayBCHAddress:     isBitpayBCHAddress,
    isBCHAddress:           isBCHAddress,
    fromCashAddr:           fromCashAddr,
    isString:               isString,
    isArray:                isArray,
    isBoolean:              isBoolean,
    isJson:                 isJson
};
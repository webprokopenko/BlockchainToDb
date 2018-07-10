/**
 * @file utilsETH.js
 */

const BigNumber = require('bignumber.js');
const CryptoJS = require('crypto-js');
const _sha3 = require('crypto-js/sha3');

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
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {string} address the given HEX adress
 * @return {boolean}
 */
const isAddress = function (address) {
    if (!/^0x[0-9a-f]{40}$/i.test(address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^0x[0-9a-f]{40}$/.test(address)/* || /^(0x)?[0-9A-F]{40,40}$/.test(address)*/) {
        // If it's all small caps or all all caps, return true
        return true;
    } else {
        // Otherwise check each case
        return isChecksumAddress(address);
    }
};

/**
 * Checks if the given string is a checksummed address
 *
 * @method isChecksumAddress
 * @param {string} address the given HEX adress
 * @return {boolean}
 */
const isChecksumAddress = function (address) {
    // Check each case
    address = address.replace('0x','');
    let addressHash = sha3(address.toLowerCase());

    for (let i = 0; i < 40; i++ ) {
        // the nth letter should be uppercase if the nth digit of casemap is 1
        if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
            return false;
        }
    }
    return true;
};
/**
 * Should be called to pad string to expected length
 *
 * @method padLeft
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
const padLeft = function (string, chars, sign) {
    return new Array(chars - string.length + 1).join(sign ? sign : '0') + string;
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
 * Takes and input transforms it into bignumber and if it is negative value, into two's complement
 *
 * @method toTwosComplement
 * @param {Number|String|BigNumber} number
 * @return {BigNumber}
 */
const toTwosComplement = function (number) {
    var bigNumber = toBigNumber(number).round();
    if (bigNumber.lessThan(0)) {
        return new BigNumber('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16).plus(bigNumber).plus(1);
    }
    return bigNumber;
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
 * Returns true if given object is valid hash string like 0x....
 *
 * @method isJson
 * @param {Object} object
 * @return {Boolean}
 */
const isHash = function (object) {
    return isString(object) && object.length === 66;
};
module.exports = {
    isAddressETH:       isAddress,
    isChecksumAddress:  isChecksumAddress,
    padLeft:            padLeft,
    toTwosComplement:   toTwosComplement,
    isHash:             isHash
}
const bitcoinJS = require('bitcoinjs-lib');
/**
 * Convert Number to Hes String
 * @method convertNumberToHex
 * @param {number} num
 * @return {string}
 */
const convertNumberToHex = function (num) {
    return `0x${num.toString(16)}`
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
module.exports = {
    convertNumberToHex:     convertNumberToHex,
    isAddress:              isAddress
};
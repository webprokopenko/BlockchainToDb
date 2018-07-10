const bitcoinJS = require('bitcoinjs-lib');
const zcore = require('zcash-bitcore-lib');
const bitcash = require('bitcoincashjs');

const isAddressZEC = function (address, network) {
    try {
        const addr = new zcore.Address(address);
        return true;
    } catch (err) {
        return false;
    }
};
const isAddressBTC = function (address, network) {
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
const isAddressBCH = function (address, network) {
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
module.exports = {
    isAddressBTC:           isAddressBTC,
    isAddressLTC:           isAddressBTC,
    isAddressZEC:           isAddressZEC,
    isLegacyBCHAddress:     isLegacyBCHAddress,
    isBitpayBCHAddress:     isBitpayBCHAddress,
    isAddressBCH:           isAddressBCH,
    fromCashAddr:           fromCashAddr
};
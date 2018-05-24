const AppError = require('./AppError');
const RpcError = require('./RpcError');
const path = require('path');
global.appRoot = path.resolve(__dirname + '/../');
//Intel logger setup
const intel = require('intel');
const ErrorLoger = {
    'eth': intel.getLogger('GethError'),
    'btc': intel.getLogger('BTCError'),
    'bch': intel.getLogger('BCHError')
};
ErrorLoger.eth.setLevel(ErrorLoger.eth.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/geth/error.log`));
ErrorLoger.btc.setLevel(ErrorLoger.btc.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/btc/error.log`));
ErrorLoger.bch.setLevel(ErrorLoger.bch.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/bch/error.log`));

module.exports = class HandlerErrors {
    constructor(ErrorObj) {
        this.setSupportedRpcClient();
        if (ErrorObj instanceof RpcError) {
            switch (ErrorObj.codeErr) {
                default:
                    ErrorLoger[ErrorObj.client]
                        .error(`${this.listClient.get(ErrorObj.client)} ${new Date()}: ${ErrorObj} code: ${ErrorObj.codeErr}`);
                    throw new RpcError(`Service error`, ErrorObj.codeErr, ErrorObj.status)
            }
        } else if (ErrorObj instanceof AppError) {
            throw new AppError(`Application error`, ErrorObj.codeErr, ErrorObj.status)
        }else {
            throw ErrorObj;
        }
    }
    setSupportedRpcClient(){
        this.listClient = new Map();
        this.listClient.set('eth', 'Ethereum');
        this.listClient.set('btc', 'Bitcoin');
        this.listClient.set('bch', 'BitcoinCash');
    }
}


const AppError = require('./AppError');
const RpcError = require('./RpcError');
const path = require('path');
global.appRoot = path.resolve(__dirname + '/../');
//Intel logger setup
const intel = require('intel');
const GethLoger =  intel.getLogger('GethError');
GethLoger.setLevel(GethLoger.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/geth/error.log`));

module.exports = class HandlerErrors {
    constructor(ErrorObj) {
        this.setSupportedRpcClient();
        if (ErrorObj instanceof RpcError) {
            switch (ErrorObj.codeErr) {
                case 208: {
                    GethLoger
                        .error(`${this.listClient
                            .get(ErrorObj.client)} ${new Date()}: ${ErrorObj} code: ${ErrorObj.codeErr}`);
                    throw new RpcError(ErrorObj.message, ErrorObj.codeErr, ErrorObj.status);
                }
                default:
                    GethLoger
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


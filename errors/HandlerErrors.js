const AppError = require('./AppError');
const RpcError = require('./RpcError');

module.exports = class HandlerErrors {
    
    constructor(ErrorObj) {
        this.setSupportedRpcClient();
        if (ErrorObj instanceof RpcError) {
            switch (ErrorObj.codeErr) {
                case 300:
                    return {

                    }
                    break;
            
                default:
                    return{
                        'code':ErrorObj.codeErr,
                        'msg':'Service Error',
                        'show':true
                    }
                    break;
            }
        } else {
            throw ErrorObj;
        }
    }
    setSupportedRpcClient(){
        this.listClient = new Map();
        this.listClient.set('eth');
        this.listClient.set('btc');
    }
}


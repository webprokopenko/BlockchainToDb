const AppError = require('./AppError');
const RpcError = require('./RpcError');
const ScannerError = require('./ScannerError');
const ScanLogModel = require('../lib/mongodb/scanLog');
//Intel logger setup
const intel = require('intel');
const GethLoger =  intel.getLogger('GethError');
GethLoger.setLevel(GethLoger.ERROR).addHandler(new intel.handlers.File(`./error.log`));

const ErrorLoger =  intel.getLogger('ErrorLoger');
ErrorLoger.setLevel(ErrorLoger.ERROR).addHandler(new intel.handlers.File(`./error.log`));

const config = require('../config/config.json');
const telegramBot = require('node-telegram-bot-api');
let botError = new telegramBot(config.telegram_token, {polling: true});

module.exports = class HandlerErrors {
    constructor(ErrorObj) {
        this.setSupportedRpcClient();
        if (ErrorObj instanceof RpcError) {
            switch (ErrorObj.codeErr) {
                case 208: {
                    GethLoger
                        .error(`${this.listClient.get(ErrorObj.client)} ${new Date()}: ${ErrorObj} code: ${ErrorObj.codeErr}`);
                    botError.sendMessage(config.telegram_chat_id, `${this.listClient.get(ErrorObj.client)} ${new Date()}: ${ErrorObj} code: ${ErrorObj.codeErr}`);
                    throw new RpcError(ErrorObj.message, ErrorObj.codeErr, ErrorObj.status);
                }
                default:
                    GethLoger
                        .error(`${this.listClient.get(ErrorObj.client)} ${new Date()}: ${ErrorObj} code: ${ErrorObj.codeErr}`);
                        botError.sendMessage(config.telegram_chat_id, `${this.listClient.get(ErrorObj.client)} ${new Date()}: ${ErrorObj} code: ${ErrorObj.codeErr}`);    
                    throw new RpcError(`Service error`, ErrorObj.codeErr, ErrorObj.status)
            }
        }else if(ErrorObj instanceof ScannerError) {
            ScanLogModel.InsertLog(
                {   
                    blockchain:ErrorObj.blockChain,
                    errorMessage:ErrorObj.message,
                    dateTimeError:new Date(),
                    dateLastScan:new Date(),
                    blockNum:ErrorObj.blockNum,
                    status:false
                })
                botError.sendMessage(config.telegram_chat_id, `${ErrorObj.message} ${ErrorObj.blockNum}  ${ErrorObj.blockChain}`);
        }else if (ErrorObj instanceof AppError) {
            throw new AppError(`Application error`, ErrorObj.codeErr, ErrorObj.status)
        }else {
            ErrorLoger
                .error(`${new Date()}: ${ErrorObj}`);
                botError.sendMessage(config.telegram_chat_id, `${new Date()}: ${ErrorObj}`);
            throw ErrorObj;
        }
    }
    setSupportedRpcClient(){
        this.listClient = new Map();
        this.listClient.set('eth', 'Ethereum');
        this.listClient.set('btc', 'Bitcoin');
        this.listClient.set('bch', 'BitcoinCash');
        this.listClient.set('btg', 'BitcoinGold');
        this.listClient.set('ltc', 'Litecoin');
        this.listClient.set('sts', 'Stats');
    }
}


const hotExchange = require('./exec/HotExchange');
const Bitfinex = require('./exec/ExchangeBitfinexToMongo');
const Gdax = require('./exec/ExchangeGdaxToMongo');
const Eth = require('./exec/ETHSaveTransactionToMongo');
const BitKindTxsToMongoScan = require('./exec/BitKindTransactionsToMongo');
function run(){
    setInterval(hotExchange.parseAndSaveETHUSD, 3600000);   //60 minutes
    setInterval(Bitfinex.savebitfinexToday, 3600000);       //60 minutes
    setInterval(Gdax.savegdaxToday, 3600000);               //60 minutes
    Eth.scan();
    setInterval(() => {
        Eth.scan();
    }, 200000);/*
    BitKindTxsToMongoScan.scanTxsToMongo('BTC');
    setInterval(() => {
        BitKindTxsToMongoScan.scanTxsToMongo('BTC');
    }, 600000);*/
    /*BitKindTxsToMongoScan.scanTxsToMongo('LTC');
    setInterval(() => {
        BitKindTxsToMongoScan.scanTxsToMongo('LTC');
    }, 600000);*/
    /*BitKindTxsToMongoScan.scanTxsToMongo('BTG');
    setInterval(() => {
        BitKindTxsToMongoScan.scanTxsToMongo('BTG');
    }, 180000);*/
}
module.exports.run = run;
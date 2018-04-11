const hotExchange = require('./exec/HotExchange');
const Bitfinex = require('./exec/ExchangeBitfinexToMongo');
const Gdax = require('./exec/ExchangeGdaxToMongo');
const BTCTxsToMongoScan = require('./exec/BTCScanTransactionToMongo');

function run(){
    //setInterval(hotExchange.parseAndSaveETHUSD, 3600000);   //60 minutes
    //setInterval(Bitfinex.savebitfinexToday, 3600000);       //60 minutes
    //setInterval(Gdax.savegdaxToday, 3600000);               //60 minutes
    BTCTxsToMongoScan();
    setInterval(BTCTxsToMongoScan, 120000);               //60 minutes
}
module.exports.run = run;
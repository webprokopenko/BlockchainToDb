const hotExchange = require('./exec/HotExchange');
const Bitfinex = require('./exec/ExchangeBitfinexToMongo');
const Gdax = require('./exec/ExchangeGdaxToMongo');
const BTCTxsToMongo = require('./exec/BTCSaveTransactionToMongo');

function run(){
    setInterval(hotExchange.parseAndSaveETHUSD, 3600000);   //60 minutes
    setInterval(Bitfinex.savebitfinexToday, 3600000);       //60 minutes
    setInterval(Gdax.savegdaxToday, 3600000);               //60 minutes
}
module.exports.run = run;
const hotExchange = require('./exec/HotExchange');
const Bitfinex = require('./exec/ExchangeBitfinexToMongo');

function run(){
    setInterval(hotExchange.parseAndSaveETHUSD, 3600000); //60 minutes
    setInterval(Bitfinex.savebitfinexToday, 3600);
}
module.exports.run = run;
const request = require('request');

const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
//Intel logger setup
const intel = require('intel');
const StatsError = intel.getLogger('StatsError');
StatsError.setLevel(StatsError.ERROR).addHandler(new intel.handlers.File(`./logs/stats/error.log`));
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
const dbHotExchangeLib = require('../lib/mongodb/hot_exchange.js');

const url = 'https://api.coinmarketcap.com/v1/ticker/'

function parseAndSaveETHUSD() {
    request.get(url + 'ethereum/?convert=USD',
        async (error, response, body) => {
            if (!body || body.length < 2) {
                return StatsError.error(`parseAndSaveETHUSD Error: Body empty : ${body}`)
            }
            if (error) {
                return StatsError.error(`parseAndSaveETHUSD Error: ${error}`)
            }
            body = JSON.parse(body) || {};

            if (!body[0].price_usd) {
                return StatsError.error(`parseAndSaveETHUSD Error: price_usd empty`)
            }
            dbHotExchangeLib.removeAllHotExchange()
                .then(() => {
                    dbHotExchangeLib.saveHotExchangeToMongoDb({ 'time': Math.floor(new Date / 1000), 'pair': 'ETH-USD', 'value': body[0].price_usd })
                    .then(()=>console.log('saveHotExchangeToMongoDb done!!'))
                    .catch(e=>console.log(`saveHotExchangeToMongoDb ${e}`))
                })
                .catch(error => {
                    StatsError.error(`removeAllHotExchange Error: ${error}`)
                });
        }
    );
}
module.exports = {
    parseAndSaveETHUSD: parseAndSaveETHUSD
}

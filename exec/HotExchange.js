const request = require('request');

const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
//Intel logger setup
const intel = require('intel');
const StatsError = intel.getLogger('StatsError');
StatsError.setLevel(StatsError.ERROR).addHandler(new intel.handlers.File(`${global.AppRoot}/logs/error.log`));
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
const dbHotExchangeLib = require('../lib/mongodb/hot_exchange.js');

    const url = 'https://api.coinmarketcap.com/v1/ticker/';

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
            dbHotExchangeLib.saveHotExchangeToMongoDb({ 'time': Math.floor(new Date / 1000), 'pair': 'ETH-USD', 'value': body[0].price_usd })
                    .catch(error=>StatsError.error(`saveHotExchangeToMongoDb ${error}`))
        }
    );
}
function parseAndSaveBTCUSD(){
    request.get(url + 'bitcoin/?convert=USD',
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
            dbHotExchangeLib.saveHotExchangeToMongoDb({ 'time': Math.floor(new Date / 1000), 'pair': 'BTC-USD', 'value': body[0].price_usd })
                    .catch(error=>StatsError.error(`saveHotExchangeToMongoDb ${error}`))
        }
    );
}
function parseAndSaveLTCUSD(){
    request.get(url + 'litecoin/?convert=USD',
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
            dbHotExchangeLib.saveHotExchangeToMongoDb({ 'time': Math.floor(new Date / 1000), 'pair': 'LTC-USD', 'value': body[0].price_usd })
                    .catch(error=>StatsError.error(`saveHotExchangeToMongoDb ${error}`))
        }
    );
}
function parseAndSaveBTGUSD(){
    request.get(url + 'bitcoin-gold/?convert=USD',
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
            dbHotExchangeLib.saveHotExchangeToMongoDb({ 'time': Math.floor(new Date / 1000), 'pair': 'BTG-USD', 'value': body[0].price_usd })
                    .catch(error=>StatsError.error(`saveHotExchangeToMongoDb ${error}`))
        }
    );
}
function parseAndSaveBCHUSD(){
    request.get(url + 'bitcoin-cash/?convert=USD',
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
            dbHotExchangeLib.saveHotExchangeToMongoDb({ 'time': Math.floor(new Date / 1000), 'pair': 'BCH-USD', 'value': body[0].price_usd })
                    .catch(error=>StatsError.error(`saveHotExchangeToMongoDb ${error}`))
        }
    );
}
function parseAndSaveUSDT() {
    request.get(url.replace('/v1', '/v2') + '825/?convert=USD',
        async (error, response, body) => {
            if (!body) {
                return StatsError.error(`parseAndSaveUSDT Error: Body empty : ${body}`)
            }
            if (error) {
                return StatsError.error(`parseAndSaveUSDT Error: ${error}`)
            }
            body = JSON.parse(body) || {};

            if (!body.data || !body.data.quotes
                || !body.data.quotes.USD || !body.data.quotes.USD.price) {
                return StatsError.error(`parseAndSaveUSDT Error: price empty`)
            }
            dbHotExchangeLib.saveHotExchangeToMongoDb({ 'time': Math.floor(new Date / 1000), 'pair': 'USDT-USD', 'value': body.data.quotes.USD.price })
                .catch(error=>StatsError.error(`saveHotExchangeToMongoDb ${error}`))
        }
    );
}
module.exports = {
    parseAndSaveETHUSD: parseAndSaveETHUSD,
    parseAndSaveUSDT:   parseAndSaveUSDT,
    parseAndSaveBCHUSD: parseAndSaveBCHUSD,
    parseAndSaveBTCUSD: parseAndSaveBTCUSD,
    parseAndSaveLTCUSD: parseAndSaveLTCUSD,
    parseAndSaveBTGUSD: parseAndSaveBTGUSD
};

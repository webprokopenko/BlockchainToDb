const request = require('request');
global.AppRoot = __dirname + '/../';
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;

const StatsError = require(`../errors/StatsError`);
const handlerErr = require(`../errors/HandlerErrors`);
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
const dbHotExchangeLib = require('../lib/mongodb/hot_exchange.js');

function parseStatUSD(addUrl, pair){
    const url = 'https://api.coinmarketcap.com/v1/ticker/';
    request.get(url + addUrl,
        async (error, response, body) => {
            try {
                if (!body || body.length < 2) {
                    new handlerErr(new StatsError(`parseStat Error: Body empty pair: ${pair}`));
                }
                if (error) {
                    new handlerErr(new StatsError(`parseStat Error: ${error}`));
                }
                body = JSON.parse(body) || {};
                if (!body[0].price_usd) {
                    new handlerErr(new StatsError(`parseStat pair: ${pair} Error: price_usd empty`));
                }
                dbHotExchangeLib.saveHotExchangeToMongoDb({ 'time': Math.floor(new Date / 1000), 'pair': pair, 'value': body[0].price_usd })
                .catch(error=>new handlerErr(new StatsError(`parseStat saveHotExchangeToMongoDb pair:${pair}, error:  ${error}`)))                  
            } catch (error) {
                new handlerErr(new StatsError(`parseStatUSD Error: ${error}`));      
            }
        }
    );
}
function parseAndSaveETHUSD() {
    parseStatUSD('ethereum/?convert=USD','ETH-USD');
}
function parseAndSaveBTCUSD(){
    parseStatUSD('bitcoin/?convert=USD','BTC-USD');
}
function parseAndSaveLTCUSD(){
    parseStatUSD('litecoin/?convert=USD','LTC-USD');
}
function parseAndSaveBTGUSD(){
    parseStatUSD('bitcoin-gold/?convert=USD','BTG-USD');
}
function parseAndSaveBCHUSD(){
    parseStatUSD('bitcoin-cash/?convert=USD','BCH-USD');
}
function parseAndSaveUSDT() {
    request.get('https://api.coinmarketcap.com/v2/ticker/825/?convert=USD',
        async (error, response, body) => {
            try {
                if(!response.headers["content-type"]==='application/json'){
                    new handlerErr(new StatsError('parseAndSaveUSDT Error: content-type !== application/json '));
                }
                if (!body) {
                    new handlerErr(new StatsError('parseAndSaveUSDT Error: Body empty '));
                }
                if (error) {
                    new handlerErr(new StatsError(`parseAndSaveUSDT Error: ${error}`));
                }
                body = JSON.parse(body) || {};
                if (!body.data || !body.data.quotes
                    || !body.data.quotes.USD || !body.data.quotes.USD.price) {
                        new handlerErr(new StatsError(`parseAndSaveUSDT Error: price empty`));
                }
                dbHotExchangeLib.saveHotExchangeToMongoDb({ 'time': Math.floor(new Date / 1000), 'pair': 'USDT-USD', 'value': body.data.quotes.USD.price })
                    .catch(error=>new handlerErr(new StatsError(`parseAndSaveUSDT saveHotExchangeToMongoDb ${error}`)))    
            } catch (error) {
                new handlerErr(new StatsError(`parseAndSaveUSDT Error: ${error}`));      
            }
            
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

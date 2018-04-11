const exchange = require(`${appRoot}/lib/mongodb/exchange`);
const dbHotExchangeLib = require(`${appRoot}/lib/mongodb/hot_exchange.js`);
//Intel logger setup
const intel = require('intel');
const StatsError = intel.getLogger('StatsError');
StatsError.setLevel(StatsError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/stats/error.log`));

async function getHotExchange(pair){
    try{
        return await dbHotExchangeLib.getHotExchange(pair);
    }
    catch(error){
        throw new Error(`Error: getHotExchange: ${error}`);
    }
}
/**
 * Return exchange Gdax from mongodb from now DateTime to - countMonths
 * @param {string} pair pairs for exchange like BTC-USD
 * @param {number} countMonths count months from 1 to 12
 * @return {(object|Error)} list pairs
 */
async function getGdax(pair, countMonths){
    if(!countMonths || countMonths<1 || countMonths>12)
         throw new Error('Months can be from 1 to 12'); 
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getMonth() - countMonths);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(1, pair, from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getGdax: ${error}`);
        throw new Error('Service error');
    }
}
async function getGdaxDay(pair){
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getDay() - 1);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(1, pair, from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getGdaxDay: ${error}`);
        throw new Error('Service error');
    }
}
async function getGdaxWeek(pair){
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getDay() - 7);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(1, pair, from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getGdaxWeek: ${error}`);
        throw new Error('Service error');
    }
}
async function getGdaxAll(pair){
    try{
        let from = Math.floor(new Date() / 1000)
        let to = Math.floor(new Date('01-01-2004') / 1000);
        let list = await exchange.getExchangeList(1, pair, from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getGdaxAll: ${error}`);
        throw new Error('Service error');
    }
}
/**
 * Return exchange Bitfinex from mongodb from now DateTime to - countMonths
 * @param {string} pair pairs for exchange like BTC-USD
 * @param {number} countMonths count months from 1 to 12
 * @return {(object|Error)} list pairs
 */
async function getBitfinex(pair, countMonths){
    if(!countMonths || countMonths<1 || countMonths>12)
         throw new Error('Months can be from 1 to 12'); 
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getMonth() - countMonths);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(2, pair, from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getBitfinex: ${error}`);
        throw new Error('Service error');
    }
}
async function getBitfinexDay(pair){
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getDay() - 1);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(2, pair, from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getBitfinexDay: ${error}`);
        throw new Error('Service error');
    }
}
async function getBitfinexWeek(pair){
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getDay() - 7);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(2, pair, from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getBitfinexWeek: ${error}`);
        throw new Error('Service error');
    }
}
async function getBitfinexAll(pair){
    try{
        let from = Math.floor(new Date() / 1000);
        let to = Math.floor(new Date('01-01-2004') / 1000);
        let list = await exchange.getExchangeList(2, pair, from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getBitfinexAll: ${error}`);
        throw new Error('Service error');
    }
}
module.exports = {
    getHotExchange:     getHotExchange,
    getGdax:            getGdax,
    getGdaxDay:         getGdaxDay,
    getGdaxWeek:        getGdaxWeek,
    getGdaxAll:         getGdaxAll,
    getBitfinex:        getBitfinex,
    getBitfinexDay:     getBitfinexDay,
    getBitfinexWeek:    getBitfinexWeek,
    getBitfinexAll:     getBitfinexAll
};

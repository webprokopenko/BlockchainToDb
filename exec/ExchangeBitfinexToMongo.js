//Bitnifex lib
const Bitfinex = require('../lib/stats/bitfinex.js');
//Arguments listener
const argv = require('minimist')(process.argv.slice(2));
//Intel logger setup
const intel = require('intel');
const StatsError = intel.getLogger('StatsError');
StatsError.setLevel(StatsError.ERROR).addHandler(new intel.handlers.File(`${global.AppRoot}/logs/error.log`));

//Api url bitginex
let url = 'https://api.bitfinex.com/v2';

if (argv.savebitfinex && argv.from && argv.to) {
    console.log('Bitnifex Scan and save from to Started ..... ');
    Bitfinex.getBitfinexCurrency(url,'BTC','USD', new Date(argv.from), new Date(argv.to));
    Bitfinex.getBitfinexCurrency(url,'BTC','EUR', new Date(argv.from), new Date(argv.to));
    Bitfinex.getBitfinexCurrency(url,'ETH','USD', new Date(argv.from), new Date(argv.to));
    Bitfinex.getBitfinexCurrency(url,'ETH','EUR', new Date(argv.from), new Date(argv.to));
}

async function savebitfinexToday(){
    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate()-1);
    try {
        Bitfinex.getBitfinexCurrency(url,'BTC','USD', tomorrow, today);
        Bitfinex.getBitfinexCurrency(url,'BTC','EUR', tomorrow, today);
        Bitfinex.getBitfinexCurrency(url,'ETH','USD', tomorrow, today);
        Bitfinex.getBitfinexCurrency(url,'ETH','EUR', tomorrow, today);    
    } catch (error) {
        StatsError.error(`${new Date()} Error: savebitfinexToday: ${error}`);
    }
}
module.exports = {
    savebitfinexToday: savebitfinexToday
};



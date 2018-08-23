const dbExchangeLib = require('../lib/mongodb/exchange.js');
//Quequ
const Quequ = require('../lib/TaskQueue');

const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();

//Intel logger setup
const intel = require('intel');
const StatsError = intel.getLogger('StatsError');
StatsError.setLevel(StatsError.ERROR).addHandler(new intel.handlers.File(`${global.AppRoot}/logs/error.log`));

//Arguments listener
const argv = require('minimist')(process.argv.slice(2));

async function getHRates(pair, from, to) {
    try {
        const rates = await publicClient.getProductHistoricRates(pair, { start: from, end: to, granularity: '3600' });
        if (rates.message || rates.length === 0)
            throw new Error(rates.message);

        return rates;
    } catch (error) {
        throw new Error(error)
    }
}
async function saveHistoricRates(pair, rates) {
    const taskQue = new Quequ(5);
    await Promise.all(rates.map(async (element) => {
        taskQue.pushTask(async done => {
            let rateData = {};
            rateData.time = element[0];
            rateData.market = 1; //GDAX
            rateData.pair = pair;
            rateData.low = element[1];
            rateData.high = element[2];
            rateData.open = element[3];
            rateData.close = element[4];
            dbExchangeLib.saveExchangeToMongoDb(rateData)
                .then(save => {
                    done();
                })
                .catch(error => {
                    if (error.code !== 11000)
                        throw new Error('Error Gdax saveHistoricRates' + error);
                    done();
                })
        })
    }));
    console.log(pair + ' done');
}
async function saveHRBtcUsd(from, to) {
    getHRates('BTC-USD', from, to)
        .then(rates => {
            saveHistoricRates('BTC-USD', rates);
        })
        .catch(error => {
            saveHRBtcUsd(from, to);
        })
}
async function saveHRBtcEur(from, to) {
    getHRates('BTC-EUR', from, to)
        .then(rates => {
            saveHistoricRates('BTC-EUR', rates);
        })
        .catch(error => {
            saveHRBtcEur(from, to);
        })
}
async function saveHREthUsd(from, to) {
    getHRates('ETH-USD', from, to)
        .then(rates => {
            saveHistoricRates('ETH-USD', rates);
        })
        .catch(error => {
            saveHREthUsd(from, to);
        })
}
async function saveHREthEur(from, to) {
    getHRates('ETH-EUR', from, to)
        .then(rates => {
            saveHistoricRates('ETH-EUR', rates);
        })
        .catch(error => {
            saveHREthEur(from, to);
        })
}


if (argv.savegdax && argv.from && argv.to) {
    console.log('GDAX Scan and save from to Started ..... ');
    saveHRBtcUsd(argv.from, argv.to);
    saveHRBtcEur(argv.from, argv.to);
    saveHREthUsd(argv.from, argv.to);
    saveHREthEur(argv.from, argv.to);
}
async function savegdaxToday(){
    let today = new Date();
    let tomorrow = new Date();
    tomorrow.setDate(today.getDate()-1);
    try {
        saveHRBtcUsd(tomorrow, today);
        saveHRBtcEur(tomorrow, today);
        saveHREthUsd(tomorrow, today);
        saveHREthEur(tomorrow, today);    
    } catch (error) {
        StatsError.error(`${new Date()} Error: savegdaxToday: ${error}`);
    }
}

module.exports = {
    savegdaxToday : savegdaxToday,
};
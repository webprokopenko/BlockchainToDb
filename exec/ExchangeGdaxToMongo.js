//Mongoose
mongoose = require('mongoose');
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
//dbEthertransactionsLib
const dbExchangeLib = require('../lib/mongodb/exchange.js');
//Quequ
const Quequ = require('../lib/TaskQueue');

const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();

//Arguments listener
const argv = require('minimist')(process.argv.slice(2));

async function getHRBtcUsd(from, to) {
    try {
        const rates = await publicClient.getProductHistoricRates('BTC-USD', { start: from, end: to, granularity: '3600' });
        if (rates.message || rates.length === 0)
            throw new Error(rates.message);

        return rates;
    } catch (error) {
        throw new Error(error)
    }
}
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
    console.log(rates.length);
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
                    if (error.code != 11000)
                        console.error('Error saveHistoricRates' + error);
                    done();
                })
        })
    }))
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
            saveHRBtcUsd(from, to);
        })
}
async function saveHREthUsd(from, to) {
    getHRates('ETH-USD', from, to)
        .then(rates => {
            saveHistoricRates('ETH-USD', rates);
        })
        .catch(error => {
            saveHRBtcUsd(from, to);
        })
}
async function saveHREthEur(from, to) {
    getHRates('ETH-EUR', from, to)
        .then(rates => {
            saveHistoricRates('ETH-EUR', rates);
        })
        .catch(error => {
            saveHRBtcUsd(from, to);
        })
}


if (argv.savegdax && argv.from && argv.to) {
    console.log('GDAX Scan and save from to Started ..... ');
    saveHRBtcUsd(argv.from, argv.to);
    saveHRBtcEur(argv.from, argv.to);
    saveHREthUsd(argv.from, argv.to);
    saveHREthEur(argv.from, argv.to);
}
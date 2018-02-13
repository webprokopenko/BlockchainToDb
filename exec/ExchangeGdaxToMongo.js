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
                console.log(save);
                done();
            })
            .catch(error=>{
                if(error.code!=11000)
                    console.error('Error saveHistoricRates' + error);
                done();
            })
        })
    }))
}
async function saveHRBtcUsd(from , to){
    try {
        let rates = await getHRates('BTC-USD',from, to);
        saveHistoricRates('BTC-USD',rates);
    } catch (error) {
        console.error(error)
    }
}
async function saveHRBtcEur(from, to){
    try {
        let rates = await getHRates('BTC-EUR',from, to);
        saveHistoricRates('BTC-EUR',rates);
    } catch (error) {
        console.error(error);
    }
}
if (argv.savegdax && argv.from && argv.to) {
    console.log('GDAX Scan and save from to Started ..... ');
    saveHRBtcUsd(argv.from, argv.to);
    saveHRBtcEur(argv.from, argv.to);
}
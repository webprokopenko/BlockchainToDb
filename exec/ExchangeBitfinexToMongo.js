//Mongoose
mongoose = require('mongoose');
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
//request
const request = require('request');
//Quequ
const Quequ = require('../lib/TaskQueue');
//dbEthertransactionsLib
const dbExchangeLib = require('../lib/mongodb/exchange.js');
//Arguments listener
const argv = require('minimist')(process.argv.slice(2));

let url = 'https://api.bitfinex.com/v2';

async function getBitnifexCurrency(urlApi, pair1, pair2, from, to){
    const taskQue = new Quequ(5);
    request.get(
        `${urlApi}/candles/trade:1h:t${pair1}${pair2}/hist?start=`
        + `${from.getTime()}` + `&end=`
        + `${to.getTime()}`,

        async (error, response, body) => {
            if(!body || body.length<2){
                console.error('Error: Body empty' + body);    
            }
            if(error){
                console.error('Error: request get ' + error);    
            }
            body  = JSON.parse(body) || {};
            
                console.log(body.length);
                await Promise.all(body.map(async (element) => {
                    taskQue.pushTask(async done => {
                        let rateData = {};
                        rateData.time = Math.ceil(element[0]/1000);
                        rateData.market = 2; //Bitnifex
                        rateData.pair = pair1+'-'+pair2;
                        rateData.low = element[4];
                        rateData.high = element[3];
                        rateData.open = element[1];
                        rateData.close = element[2];
            
                        dbExchangeLib.saveExchangeToMongoDb(rateData)
                        .then(save => {
                            done();
                        })
                        .catch(error=>{
                            if(error.code!=11000)
                                console.error('Error getBitnifexCurrency' + error);
                            done();
                        })
                    })
                }))
                return false;        
        }
    )
}

if (argv.savebitnifex && argv.from && argv.to) {
    console.log('Bitnifex Scan and save from to Started ..... ');
    getBitnifexCurrency(url,'BTC','USD', new Date(argv.from), new Date(argv.to));
    //getBitnifexCurrency(url,'BTC','EUR', new Date(argv.from), new Date(argv.to));
    getBitnifexCurrency(url,'ETH','USD', new Date(argv.from), new Date(argv.to));
    //getBitnifexCurrency(url,'ETH','EUR', new Date(argv.from), new Date(argv.to));
}




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


let url = 'https://api.bitfinex.com/v2';
async function getBitnifexCurrency(urlApi, pair1, pair2, day){
    const taskQue = new Quequ(5);
    let from = new Date(day - 60*60*120*1000);
    request.get(
        `${urlApi}/candles/trade:1h:t${pair1}${pair2}/hist?start=`
        + `${from.getTime()}` + `&end=`
        + `${day.getTime()}`,

        async (error, response, body) => {
            if(!body || body.length<2){
                console.log('Error: Body empty' + body);    
            }
            body  = JSON.parse(body) || {};
            if(body.length===120){
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
                
                return false;        
            }
        }
    )
}
async function saveBtcUsc(){
    try{
        let i=24;
        let j=i*2
        while(i <= j){
                let day = new Date(new Date() - 60*60*i*1000)
                let currencyBitfinex = await getBitnifexCurrency(url,'BTC','USD', day);
                i = i+24;    
        }
    }catch(e){
        console.log('Error: ' + e)
    }
}
saveBtcUsc();


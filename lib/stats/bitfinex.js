//request
const request = require('request');
//Quequ
const Quequ = require('../TaskQueue');
//dbEthertransactionsLib
const dbExchangeLib = require('../mongodb/exchange.js');

function getBitfinexCurrency(urlApi, pair1, pair2, from, to) {
    const taskQue = new Quequ(5);
    request.get(
        `${urlApi}/candles/trade:1h:t${pair1}${pair2}/hist?start=`
        + `${from.getTime()}` + `&end=`
        + `${to.getTime()}`,

        async (error, response, body) => {
            if (!body || body.length < 2) {
                throw new Error('Error: Body empty' + body);
            }
            if (error) {
                throw new Error('Error: request get' + error);
            }
            body = JSON.parse(body) || {};
            
            await Promise.all(body.map(async (element) => {
                taskQue.pushTask(async done => {
                    let rateData = {};
                    rateData.time = Math.ceil(element[0] / 1000);
                    rateData.market = 2; //Bitnifex
                    rateData.pair = pair1 + '-' + pair2;
                    rateData.low = element[4];
                    rateData.high = element[3];
                    rateData.open = element[1];
                    rateData.close = element[2];

                    dbExchangeLib.saveExchangeToMongoDb(rateData)
                        .then(save => {
                            done();
                        })
                        .catch(error => {
                            if (error.code !== 11000)
                                throw new Error('Error getBitnifexCurrency' + error);
                            done();
                        })
                })
            }))
        }
    )

}
module.exports = {
    getBitfinexCurrency: getBitfinexCurrency
};
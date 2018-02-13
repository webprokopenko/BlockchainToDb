const exchange = require(`${appRoot}/lib/mongodb/exchange`);
//Intel logger setup
const intel = require('intel');
const StatsError = intel.getLogger('StatsError');
StatsError.setLevel(StatsError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/stats/eror.log`));


async function getGdaxBtcUsd(countMonths) {
    if(!countMonths || countMonths<1 || countMonths>12)
         throw new Error('Mounths can be from 1 to 12'); 
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getMonth() - countMonths);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(1, 'BTC-USD', from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getGdaxBtcUsd: ${error}`)
    }
}
async function getGdaxBtcEur(countMonths) {
    if(!countMonths || countMonths<1 || countMonths>12)
         throw new Error('Mounths can be from 1 to 12'); 
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getMonth() - countMonths);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(1, 'BTC-EUR', from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getGdaxBtcEur: ${error}`)
    }
}
async function getGdaxEthUsd(countMonths) {
    if(!countMonths || countMonths<1 || countMonths>12)
         throw new Error('Mounths can be from 1 to 12'); 
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getMonth() - countMonths);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(1, 'ETH-USD', from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getGdaxBtcUsd: ${error}`)
    }
}
async function getGdaxEthEur(countMonths) {
    if(!countMonths || countMonths<1 || countMonths>12)
         throw new Error('Mounths can be from 1 to 12'); 
    try {
        let from = new Date();
        let to = new Date();
        to = to.setMonth(to.getMonth() - countMonths);
        from = Math.floor(from/1000);
        to = Math.floor(to/1000);
        let list = await exchange.getExchangeList(1, 'ETH-EUR', from, to);
        return list;
    } catch (error) {
        StatsError.error(`Error: getGdaxBtcEur: ${error}`)
    }
}

module.exports = {
    getGdaxBtcUsd: getGdaxBtcUsd,
    getGdaxBtcEur: getGdaxBtcEur,
    getGdaxEthEur: getGdaxEthEur,
    getGdaxEthUsd:getGdaxEthUsd
}

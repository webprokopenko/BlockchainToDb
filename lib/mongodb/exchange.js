require(`../../models/ExchangeModel.js`);
const Exchange = mongoose.model('exchange');

/**
 * Return exchange lists from mongodb
 * @param {integer} market market like GDAX-1,BITFINEX-2
 * @param {string} pair pair like BTC-USD or ETH-EUR
 * @param {Unix timestamp} from column time $lte: from
 * @param {Unix timestamp} to column time $gte: to
 * @returns {Promise}
 */
async function getExchangeList(market, pair, from, to) {
    return new Promise((resolve, reject) => {
        Exchange
            .find()
            .where({ 'market': market, 'pair': pair, time: { $lte: from, $gte: to } })
            .select('-_id -__v -market')
            .then(res => {  
                res ? resolve(res) : reject(new Error(`getExchangeList no found data`));
            })
            .catch(e => reject(e));
    })
}
/**
 * Save Object in mongoose exchange schema
 * @param {object} Data Exchange object
 * @returns {Promise}
 */
async function saveExchangeToMongoDb(Data) {
    return new Promise((resolve, reject) => {
        let exchange = new Exchange(Data);
        exchange.save()
            .then(() => {
                resolve(true);
            })
            .catch(e => {
                reject(e);
            });
    })
}
module.exports = {
    saveExchangeToMongoDb: saveExchangeToMongoDb,
    getExchangeList: getExchangeList
}

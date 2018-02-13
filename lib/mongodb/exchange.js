require(`../../models/ExchangeModel.js`);
const Exchange = mongoose.model('exchange');


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

async function saveExchangeToMongoDb(Data) {
    return new Promise((resolve, reject) => {
        exchange = new Exchange(Data);
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

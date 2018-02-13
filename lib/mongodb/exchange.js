require(`../../models/ExchangeModel.js`);
const Exchange = mongoose.model('exchange');    

async function saveExchangeToMongoDb(Data) {
    return new Promise((resolve, reject) => {
        try {
            exchange = new Exchange(Data);
            exchange.save()
                .then(() => {
                    resolve(true);
                })
                .catch(e => {
                    reject(e);
                });
        } catch (error) {
            reject(error)
        }
    })
}
module.exports = {
    saveExchangeToMongoDb: saveExchangeToMongoDb
}

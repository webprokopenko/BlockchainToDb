require(`../../models/HotExchangeModel.js`);
const HotExchange = mongoose.model('hot_exchange');

async function saveHotExchangeToMongoDb(Data){
    return new Promise((resolve, reject) => {
        let exchange = new HotExchange(Data);
        exchange.save()
            .then(() => {
                resolve(true);
            })
            .catch(e => {
                reject(e);
            });
    })
}
async function getHotExchange(pair) {
    return new Promise((resolve, reject) => {
        HotExchange
            .findOne()
            .sort({'time' : -1})
            .where({'pair': pair})
            .select('-_id -__v -time')
            .limit(1)
            .then(res => {  
                res ? resolve(res) : reject(new Error(`getHotExchange no found data`));
            })
            .catch(e => {reject(e)});
    })
}
async function removeAllHotExchange(){
    return new Promise((resolve, reject)=>{
        HotExchange.remove({})
            .then(resolve(true))
            .catch(e=>reject(e));
    });
}
module.exports = {
    saveHotExchangeToMongoDb:   saveHotExchangeToMongoDb,
    getHotExchange:             getHotExchange,
    removeAllHotExchange:       removeAllHotExchange
};
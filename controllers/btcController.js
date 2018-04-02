const gethBTClocal = require(`${appRoot}/lib/bitcoin/getBTCbitcoin.js`),
    getBTCremote = require(`${appRoot}/lib/bitcoin/getBTCbitcore.js`);

//Intel logger setup
const intel = require('intel');
const BtcError = intel.getLogger('BtcError');
BtcError.setLevel(BtcError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/btc/error.log`));

async function getBalance(address){
    try {
        let balance = await getBTCremote.getBalance(address);
        return {'balance':balance}
    } catch (error) {
        BtcError.error(`${new Date()} Error: getBalance: ${error}`);
    }
}
async function sendRawTransaction(raw){
    try {
        let res = await gethBTClocal.sendRawTransaciton(raw);
        return {'res':res};
    } catch (error) {
        BtcError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
    }
}
async function getUTXOs(addr){
    try{
        return await gethBTCremote.getUTXOs(addr);
    }catch (error){
        BtcError.error(`${new Date()} Error: getUTXOs: ${error}`);
    }
}
async function getTxList(txid){
    try{
        return await gethBTCremote.getTxList(txid);
    }catch (error){
        BtcError.error(`${new Date()} Error: getTxList: ${error}`);
    }
}
async function getTxById(txid){
    try{
        return await gethBTCremote.getTxById(txid);
    }catch (error){
        BtcError.error(`${new Date()} Error: getTxById: ${error}`);
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    listUnspent:            listUnspent,
    gettxout:               gettxout,
};
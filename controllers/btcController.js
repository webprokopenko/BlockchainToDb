const gethBTC = require(`${appRoot}/lib/bitcoin/getBTCbitcoin.js`);

//Intel logger setup
const intel = require('intel');
const BtcError = intel.getLogger('BtcError');
BtcError.setLevel(BtcError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/btc/error.log`));

async function getBalance(address){
    try {
        let balance = await gethBTC.getBalanceCmd(address);
        return {'balance':balance}
    } catch (error) {
        BtcError.error(`${new Date()} Error: getBalance: ${error}`);
    }
}
async function sendRawTransaction(raw){
    try {
        let res = await gethBTC.sendRawTransacitonCmd(raw);
        return {'res':res};
    } catch (error) {
        BtcError.error(`${new Date()} Error: sendRawTransaction: ${error}`);
    }
}
async function listUnspent(addr){
    try{
        return await gethBTC.listUnspentCmd(addr);
    }catch (error){
        BtcError.error(`${new Date()} Error: listUnspen: ${error}`);
    }
}
async function gettxout(txid){
    try{
        return await gethBTC.listUnspentCmd(txid);
    }catch (error){
        BtcError.error(`${new Date()} Error: gettxout: ${error}`);
    }
}
module.exports = {
    getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    listUnspent:            listUnspent,
    gettxout:               gettxout,
}
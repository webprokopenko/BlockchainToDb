const   gethXMRlocal = require(`${appRoot}/lib/monero/getXMRmonero.js`),
    xmrConfig = require(`${appRoot}/config/config.json`).XMRRpc;

//Intel logger setup
const intel = require('intel');
const XmrError = intel.getLogger('XmrError');
XmrError.setLevel(XmrError.ERROR).addHandler(new intel.handlers.File(`${appRoot}/logs/xmr/error.log`));

async function getBlock(height){
    try{
        return {block: await gethXMRlocal.getBlockData(height)};
    }catch (error){
        XmrError.error(`${new Date()} Error: getBlock: ${error}`);
        throw new Error('Service error');
    }
}
async function getTxsByHash(hashes){
    try{
        return {txs: await gethXMRlocal.getTxsByHash(hashes)};
    }catch (error){
        XmrError.error(`${new Date()} Error: getTxsByHash: ${error}`);
        throw new Error('Service error');
    }
}
module.exports = {
    /*getBalance:             getBalance,
    sendRawTransaction:     sendRawTransaction,
    getUTXOs:               getUTXOs,
    getTxList:              getTxList,*/
    getBlock:               getBlock,
    getTxsByHash:           getTxsByHash
};
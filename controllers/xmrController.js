const   gethXMRlocal = require(`../lib/monero/getXMRmonero.js`);
//    xmrConfig = require(`${appRoot}/config/config.json`).XMRRpc;


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
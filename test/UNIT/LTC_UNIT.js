const path = require('path');
global.appRoot = path.resolve(__dirname + '/../../');
const chai = require('chai');
const expect = chai.expect;
global.mongoose = require('mongoose');
const mongodbConnectionString = require(appRoot + '/config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
const LTCRpc = require('../../lib/litecoin/getLTClitecoin');
const mongodbLib = require(`${appRoot}/lib/mongodb/ltctransactions`);
const testData = require(appRoot + '/test/SERVICES/LTC/ltc_data.json');

const ltcData = {
    blockNum: 30000,
    blockHash: '9a83b80026d747a81806ec8b8fba689d57dc99977877f7d42b379c27604fa626',
    blockKeys: [
        'hash', 'confirmations','strippedsize', 'size', 'height', 'weight' ,'version', 'versionHex', 'merkleroot',
        'tx', 'time', 'mediantime', 'nonce', 'bits', 'difficulty', 'chainwork',
        'previousblockhash', 'nextblockhash'
    ],
    transactionHash: '066b3c59e6b50b50c3295b7a5f633ee3e956b0fc7459401a98cae2db00301731',
    transactionKeys: [
        'timestamp' ,'blockhash' ,'blockheight', 'txid', 'version', 'locktime', 'size',
        'vin', 'vout'
    ],
    balance: 0.000011,
    utoxsKeys: [
        'txid', 'vout', 'address', 'scriptPubKey', 'amount'
    ],
    address: 'mv1138niTSfx7j24Ar12tpjXp15yikRybA' // testnet LTC
};

describe('LTC RPC lib', async () => {
    it('getBlockCount', async () => {
        const blockCount = await LTCRpc.getBlockCount();
        expect(blockCount).to.be.an('number');
    });
    it('getBlockData', async () => {
        const data = await LTCRpc.getBlockData(ltcData.blockHash);
        expect(data).to.be.an('object')
            .that.have.all.keys(ltcData.blockKeys);
    });
    it('getBlockHash', async () => {
        const hash = await LTCRpc.getBlockHash(ltcData.blockNum);
        expect(hash).to.be.an('string');
    });
    it('getTransactionsFromBlock', async () => {
        const txs = await LTCRpc.getTransactionsFromBlock(ltcData.blockNum);
        expect(txs).to.be.an('array');
        expect(txs[0]).to.be.an('object')
            .that.have.all.keys(ltcData.transactionKeys);
    });
    it('getBalance', async () => {
        const balance = await LTCRpc.getBalance(ltcData.address);
        expect(balance).to.be.an('number');
    });
    it('getUTXOs', async () => {
        const utxos = await LTCRpc.getUTXOs(ltcData.address);
        expect(utxos).to.be.an('array');
        if(utxos.length > 0) {
            expect(utxos[0]).to.be.an('object')
                .that.have.all.keys(ltcData.utoxsKeys);
        }
    });
    it('getTxsByAddress', async () => {
        const txs = await LTCRpc.getTxsByAddress(ltcData.address);
        expect(txs).to.be.an('array');
        if (txs.length > 0) {
            expect(txs[0]).to.be.an('object')
                .that.have.all.keys(btcData.transactionKeys);
        }
    });
    it('getRawTransaction', async () => {
        const tx = await LTCRpc.getRawTransaction(ltcData.transactionHash);
        expect(tx).to.be.an('object')
            .that.have.all.keys(Object.keys(testData.rawTransaction));
    });
});
describe('LTC MongoDB lib', async () => {
    it('SavePendingTransaction', async () => {
        const tx = await mongodbLib.saveTempTransactionToMongoDb(testData.PendingTransaction);
        expect(tx).to.equal(true);
        const remvTx = await mongodbLib.removeTempTransaction(testData.PendingTransaction.txid);
        expect(remvTx).to.equal(true);
    });
})

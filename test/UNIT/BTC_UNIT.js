const path = require('path');
global.appRoot = path.resolve(__dirname + '/../../');
const chai = require('chai');
const expect = chai.expect; 
global.mongoose = require('mongoose');
const mongodbConnectionString = require(appRoot + '/config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
const BTCRpc = require('../../lib/bitcoin/getBTCbitcoin');
const mongodbLib = require(`${appRoot}/lib/mongodb/btctransactions`);
const testData = require(appRoot + '/test/SERVICES/BTC/btc_data.json');

const btcData = {
    blockNum: 1350026,
    blockHash: '000000000000006a55547f3371c0dfacfb923dc65e1e2f7e8794334f1aeba783',
    blockKeys: [
        'hash', 'confirmations','strippedsize', 'size', 'height', 'weight' ,'version', 'versionHex', 'merkleroot',
        'tx', 'time', 'mediantime', 'nonce', 'bits', 'difficulty', 'chainwork',
        'previousblockhash', 'nextblockhash'
    ],
    transactionHash: '843480dc620615b94da12a037076a4bff85592d1d10952c158b5060d78ef6adc',
    blockTransactionsKeys: [
        'blockhash',
        'blockheight',
        'locktime',
        'size',
        'timestamp',
        'txid',
        'version',
        'vin',
        'vout'
    ],
    rawTransactionKeys: [
        'time' ,'blockhash' ,'blocktime', 'txid', 'version', 'locktime', 'size',
        'vin', 'vout', 'vsize','confirmations', 'hex', 'hash'
    ],
    balance: 0.000011,
    utoxsKeys: [
        'txid', 'vout', 'address', 'scriptPubKey', 'amount'
    ],
    address: 'ms4pEdg3zu4cdy9yjye1BUta9mwNGMTKgD' // testnet BTC
};

describe('BTC RPC lib', async () => {
    it('getBlockCount', async () => {
        const blockCount = await BTCRpc.getBlockCount();
        expect(blockCount).to.be.an('number');
    });
    it('getBlockData', async () => {
        const data = await BTCRpc.getBlockData(btcData.blockHash);
        expect(data).to.be.an('object')
            .that.have.all.keys(btcData.blockKeys);
    });
    it('getBlockHash', async () => {
        const hash = await BTCRpc.getBlockHash(btcData.blockNum);
        expect(hash).to.be.an('string');
    });
    it('getTransactionsFromBlock', async () => {
        const txs = await BTCRpc.getTransactionsFromBlock(btcData.blockNum);
        expect(txs).to.be.an('array');
        expect(txs[0]).to.be.an('object')
            .that.have.all.keys(btcData.blockTransactionsKeys);
    });
    it('getBalance', async () => {
        const balance = await BTCRpc.getBalance(btcData.address);
        expect(balance).to.be.an('number');
    });
    it('getUTXOs', async () => {
        const utxos = await BTCRpc.getUTXOs(btcData.address);
        expect(utxos).to.be.an('array');
        if(utxos.length > 0) {
            expect(utxos[0]).to.be.an('object')
                .that.have.all.keys(btcData.utoxsKeys);
        }
    });
    it('getTxsByAddress', async () => {
        const txs = await BTCRpc.getTxsByAddress(btcData.address);
        expect(txs).to.be.an('array');
        if (txs.length > 0) {
            expect(txs[0]).to.be.an('object')
                .that.have.all.keys(btcData.transactionKeys);
        }
    });
    it('getRawTransaction', async () => {
        const tx = await BTCRpc.getRawTransaction(btcData.transactionHash);
        expect(tx).to.be.an('object')
         .that.have.all.keys(btcData.rawTransactionKeys);
    });
});
describe('BTC MongoDB lib', async () => {
    it('SavePendingTransaction', async () => {
        const tx = await mongodbLib.saveTempTransactionToMongoDb(testData.PendingTransaction);
        expect(tx).to.equal(true);
        const remvTx = await mongodbLib.removeTempTransaction(testData.PendingTransaction.txid);
        expect(remvTx).to.equal(true);
    });
    it('Get Transactions List', async () => {
        const txs = await mongodbLib.getAllTransactionList_('2NFMcjyW8XaeB4ruAzYcdyCNsSjhBVrUoDG', 1, 0);
        console.log(txs);
    })
})

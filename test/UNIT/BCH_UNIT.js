const path = require('path');
global.appRoot = path.resolve(__dirname + '/../../');
const chai = require('chai');
const expect = chai.expect; 
global.mongoose = require('mongoose');
const mongodbConnectionString = require(appRoot + '/config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
const BCHRpc = require('../../lib/bitcoin_cash/getBCHbitcoin_cash');
const utils = require(`${appRoot}/lib/bitcoin/utilsBTC`);
const mongodbLib = require(`${appRoot}/lib/mongodb/bchtransactions`);

const bchData = {
    network: 'livenet',
    legacy: '16G3nBgH8cEWkcTiDuzjzMunhNwaSRwrQH',
    bitpay: 'CMiwME2M1fD3ekN8ufKfZsXpKW9zM4wwXy',
    cash: 'bitcoincash:qqumzvpteg66fskct2wwnph7gcrvaf0u6vjum6mwe3',
    cashSplit1: 'qqumzvpteg66fskct2wwnph7gcrvaf0u6vjum6mwe3',
    blockNum: 531322,
    blockHash: '0000000000000000013143cd4b238033044f83bc7a1bd37cd6785952825562ec',
    blockKeys: [
        'hash', 'confirmations', 'size', 'height', 'version', 'versionHex', 'merkleroot',
        'tx', 'time', 'mediantime', 'nonce', 'bits', 'difficulty', 'chainwork',
        'previousblockhash', 'nextblockhash'
    ],
    transactionHash: '87329fae502377053b4d1f24daad70a94cf21cc4aa2f084ea584fe51104a4060',
    transactionKeys: [
        'timestamp' ,'blockhash' ,'blockheight', 'txid', 'version', 'locktime', 'size',
        'vin', 'vout'
    ],
    balance: 0.000011,
    utoxsKeys: [
        'txid', 'vout', 'address', 'scriptPubKey', 'amount'
    ]
};

describe('BCH utils', () => {
    it('isLegacyBCHAddress', done => {
        const addr = utils.isLegacyBCHAddress(bchData.legacy, bchData.network);
        expect(addr).to.be.equal(bchData.cashSplit1);
        done();
    });
    it('isBitpayBCHAddress', done => {
        const addr = utils.isBitpayBCHAddress(bchData.bitpay, bchData.network);
        expect(addr).to.be.equal(bchData.cashSplit1);
        done();
    });
    it('isBCHAddress', done => {
        const addr = utils.isBCHAddress(bchData.cash, bchData.network);
        expect(addr).to.be.equal(bchData.cashSplit1);
        done();
    })
});
describe('BCH mongodb lib', async () => {
    it('getTransactionslist', async () => {
        const txsList = await mongodbLib.getTransactionslist(bchData.cashSplit1);
        expect(txsList).to.be.an('array');
        expect(txsList[0]._doc).to.be.an('object')
            .that.have.all.keys(bchData.transactionKeys.concat(['__v', '_id']));
    });
    it('saveTransactionToMongoDb', async () => {});
    it('getLastBlock', async () => {
        const last = await mongodbLib.getLastBlock();
        expect(last).to.be.an('number');
    });
});
describe('BCH RPC lib', async () => {
    it('sendRawTransaction', async () => {});
    it('getBlockCount', async () => {
        const blockCount = await BCHRpc.getBlockCount();
        expect(blockCount).to.be.an('number');
    });
    it('getBlockData', async () => {
        const data = await BCHRpc.getBlockData(bchData.blockHash);
        expect(data).to.be.an('object')
            .that.have.all.keys(bchData.blockKeys);
    });
    it('getBlockHash', async () => {
        const hash = await BCHRpc.getBlockHash(bchData.blockNum);
        expect(hash).to.be.an('string');
    });
    it('getTransactionsFromBlock', async () => {
        const txs = await BCHRpc.getTransactionsFromBlock(bchData.blockNum);
        expect(txs).to.be.an('array');
        expect(txs[0]).to.be.an('object')
            .that.have.all.keys(bchData.transactionKeys);
    });
    it('getBalance', async () => {
        const balance = await BCHRpc.getBalance(bchData.cashSplit1);
        expect(balance).to.be.an('number');
    });
    it('getUTXOs', async () => {
        const utxos = await BCHRpc.getUTXOs(bchData.cashSplit1);
        expect(utxos).to.be.an('array');
        expect(utxos[0]).to.be.an('object')
            .that.have.all.keys(bchData.utoxsKeys);
    });
    it('getTxsByAddress', async () => {
        const txs = await BCHRpc.getTxsByAddress(bchData.cashSplit1);
        expect(txs).to.be.an('array');
        expect(txs[0]).to.be.an('object')
            .that.have.all.keys(bchData.transactionKeys);
    });
});
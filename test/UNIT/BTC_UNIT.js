const path = require('path');
global.appRoot = path.resolve(__dirname + '/../../');
const chai = require('chai');
const expect = chai.expect; 
global.mongoose = require('mongoose');
const mongodbConnectionString = require(appRoot + '/config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
const BTCRpc = require('../../lib/bitcoin/getBTCbitcoin');
const utils = require(`${appRoot}/lib/bitcoin/utilsBTC`);
const mongodbLib = require(`${appRoot}/lib/mongodb/btctransactions`);
const testData = require(appRoot + '/test/SERVICES/BTC/btc_data.json');

const btcData = {
    blockNum: 30000,
    blockHash: '00000000de1250dc2df5cf4d877e055f338d6ed1ab504d5b71c097cdccd00e13',
    blockKeys: [
        'hash', 'confirmations','strippedsize', 'size', 'height', 'weight' ,'version', 'versionHex', 'merkleroot',
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

describe('BTC RPC', () => {
    it('getBlockData', async () => {
        const data = await BTCRpc.getBlockData(btcData.blockHash);
        expect(data).to.be.an('object')
            .that.have.all.keys(btcData.blockKeys);
    });
    it('getTransactionsFromBlock', async () => {
        const data = await BTCRpc.getTransactionsFromBlock(btcData.blockNum);
        expect(data[0]).have.all.keys(btcData.transactionKeys);
    });
    it('getBlockCount', async () => {
        const data = await BTCRpc.getBlockCount();
        expect(data).equal(testData.blockCount);
    });

    


});

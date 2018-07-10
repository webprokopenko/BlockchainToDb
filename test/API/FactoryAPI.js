process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();
const testData = require(appRoot + '/test/SERVICES/BTC/btc_data.json');
const btcData = {
    address: 'ms4pEdg3zu4cdy9yjye1BUta9mwNGMTKgD', // testnet BTC
    transactionHash: '843480dc620615b94da12a037076a4bff85592d1d10952c158b5060d78ef6adc',
    transactionKeys: [
        'timestamp' ,'blockhash' ,'blockheight', 'txid', 'version', 'locktime', 'size',
        'vin', 'vout'
    ],
    rawTransactionKeys: [
        'time' ,'blockhash' ,'blocktime', 'txid', 'version', 'locktime', 'size',
        'vin', 'vout', 'vsize','confirmations', 'hex', 'hash'
    ],
    balance: 0.000011,
    utoxsKeys: [
        'txid', 'vout', 'address', 'scriptPubKey', 'amount'
    ]
};
const ethData = {
    testnet: {
        address: '0xb4016d8ca33ab5970b1acdc3fb9a63a123a30638'
    }
};

chai.use(chaiHttp);

describe('Ethereum factory', () => {
    describe('/GET ETH utxos', () => {
        it('it should GET Ethereum address balance', done => {
            chai.request(server)
                .get('/api/v4.2/ETH/getBalance/' + ethData.testnet.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys(['balance']);console.dir(res.body);
                    done();
                });
        })
    });
});

describe('Bitcoin factory', () => {
    describe('/GET BTC utxos', () => {
        it('it should GET Bitcoin address utxos', done => {
            chai.request(server)
                .get('/api/v4.2/BTC/getUTXOs/' + btcData.address + '/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys(['pages', 'utxos']);
                    res.body.pages.should.be.a('number');
                    res.body.utxos.should.be.a('array');
                    if(res.body.utxos.length > 0) {
                        res.body.utxos[0].should.be.a('object');
                        res.body.utxos[0].should.have.all.keys(btcData.utoxsKeys);
                    }
                    done();
                });
        })
    });
});
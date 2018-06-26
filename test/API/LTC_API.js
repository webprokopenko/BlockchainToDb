process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();
const testData = require(appRoot + '/test/SERVICES/LTC/ltc_data.json');
const ltcData = {
    address: 'ms4pEdg3zu4cdy9yjye1BUta9mwNGMTKgD', // testnet LTC
    transactionId: '6c0ce887a27f70084c4018752b30b0b96ba8cb9968d6d748ead61064defcc549',
    transactionKeys: [
        'timestamp' ,'blockhash' ,'blockheight', 'txid', 'version', 'locktime', 'size',
        'vin', 'vout'
    ],
    rawTransactionKeys: [
        'txid', 'version', 'locktime', 'size', 'vin', 'vout'
    ],
    balance: 0.000011,
    utoxsKeys: [
        'txid', 'vout', 'address', 'scriptPubKey', 'amount'
    ]
};

chai.use(chaiHttp);

describe('Litecoin apiv4.0', () => {
    describe('/GET LTC getBalance', () => {
        it('it should GET Litecoin address balance', done => {
            chai.request(server)
                .get('/api/v4.0/LTC/getBalance/' + ltcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('balance');
                    res.body.balance.should.be.a('number');
                    done();
                });
        })
    });
    describe('/GET LTC getUTXOs', () => {
        it('it should GET Litecoin address unspent transactions array', done => {
            chai.request(server)
                .get('/api/v4.0/LTC/getUTXOs/' + ltcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('utxos');
                    res.body.utxos.should.be.a('array');
                    if(res.body.utxos.length > 0) {
                        res.body.utxos[0].should.be.a('object');
                        res.body.utxos[0].should.have.all.keys(ltcData.utoxsKeys);
                    }
                    done();
                });
        })
    });
    describe('/GET LTC getTxList', () =>    {
        it('it should GET Litecoin address transactions array', done => {
            chai.request(server)
                .get('/api/v4.0/LTC/getTxList/' + ltcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('txs');
                    if(res.body.txs.length > 0) {
                        res.body.txs[0].should.be.a('object');
                        res.body.txs[0].should.have.all.keys(ltcData.transactionKeys);
                    }
                    done();
                });
        })
    });
});
describe('Litecoin apiv4.2', () => {
    describe('/GET LTC getBalance', () => {
        it('it should GET Litecoin address balance', done => {
            chai.request(server)
                .get('/api/v4.2/LTC/getBalance/' + ltcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('balance');
                    res.body.balance.should.be.a('number');
                    done();
                });
        })
    });
    describe('/GET LTC getTxList', () => {
        it('it should GET Litecoin address transactions array', done => {
            chai.request(server)
                .get('/api/v4.2/BTC/getTxList/' + ltcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('pages', 'pending', 'transactions');
                    res.body.pages.should.be.a('number');
                    res.body.pending.should.be.a('array');
                    res.body.transactions.should.be.a('array');
                    if (res.body.transactions.length > 0) {
                        res.body.transactions[0].should.be.a('object');
                        res.body.transactions[0].should.have.all.keys(ltcData.transactionKeys);
                    }
                    done();
                });
        })
    });
    describe('/GET LTC getUTXOs', () => {
        it('it should GET Litecoin address unspent transactions array', done => {
            chai.request(server)
                .get('/api/v4.2/LTC/getUTXOs/' + ltcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys(['pages', 'utxos']);
                    res.body.pages.should.be.a('number');
                    res.body.utxos.should.be.a('array');
                    if(res.body.utxos.length > 0) {
                        res.body.utxos[0].should.be.a('object');
                        res.body.utxos[0].should.have.all.keys(ltcData.utoxsKeys);
                    }
                    done();
                });
        })
    });
    describe('/GET LTC getTransactionById', () => {
        it('it should GET Litecoin raw transaction', done => {
            chai.request(server)
                .get('/api/v4.2/LTC/getTransactionById/' + ltcData.transactionId)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys(Object.keys(testData.rawTransaction));
                    done();
                });
        })
    });
});
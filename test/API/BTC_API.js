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
    transactionKeys_v42: [
        'timestamp' ,'blockhash' ,'blockheight', 'txid', 'version', 'locktime', 'size',
        'vin', 'vout', 'fee', 'vinAmmount', 'voutAmmount'
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

chai.use(chaiHttp);

describe('Bitcoin apiv4.0', () => {
    describe('/GET BTC getBalance', () => {
        it('it should GET Bitcoin address balance', done => {
            chai.request(server)
                .get('/api/v4.0/BTC/getBalance/' + btcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('balance');
                    res.body.balance.should.be.a('number');
                    res.body.balance.should.be.above(0);
                    done();
                });
        })
    });
    describe('/GET BTC getUTXOs', () => {
        it('it should GET Bitcoin address unspent transactions array', done => {
            chai.request(server)
                .get('/api/v4.0/BTC/getUTXOs/' + btcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('utxos');
                    res.body.utxos.should.be.a('array');
                    res.body.utxos.length.should.be.above(0);
                    if(res.body.utxos.length > 0) {
                        res.body.utxos[0].should.be.a('object');
                        res.body.utxos[0].should.have.all.keys(btcData.utoxsKeys);
                    }
                    done();
                });
        })
    });
    describe('/GET BTC getTxList', () =>    {
        it('it should GET Bitcoin address transactions array', done => {
            chai.request(server)
                .get('/api/v4.0/BTC/getTxList/' + btcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('txs');
                    res.body.txs.length.should.be.above(0);
                    if(res.body.txs.length > 0) {
                        res.body.txs[0].should.be.a('object');
                        res.body.txs[0].should.have.all.keys(btcData.transactionKeys);
                    }
                    done();
                });
        })
    });
});
describe('Bitcoin apiv4.2', () => {
    describe('/GET BTC getBalance', () => {
        it('it should GET Bitcoin address balance', done => {
            chai.request(server)
                .get('/api/v4.2/BTC/getBalance/' + btcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('balance');
                    res.body.balance.should.be.a('number');
                    res.body.balance.should.be.above(0);
                    done();
                });
        })
    });
    describe('/GET BTC getTxList', () => {
        it('it should GET Bitcoin address transactions array', done => {
            chai.request(server)
                .get('/api/v4.2/BTC/getTransactionsList/' + btcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('pages', 'pending', 'transactions');
                    res.body.pages.should.be.a('number');
                    res.body.pending.should.be.a('array');
                    res.body.transactions.should.be.a('array');
                    res.body.transactions.length.should.be.above(0);
                    if (res.body.transactions.length > 0) {
                        res.body.transactions[0].should.be.a('object');
                        res.body.transactions[0].should.have.all.keys(btcData.transactionKeys_v42);
                    }
                    done();
                });
        })
    });
    describe('/GET BTC getUTXOs', () => {
        it('it should GET Bitcoin address unspent transactions array', done => {
            chai.request(server)
                .get('/api/v4.2/BTC/getUTXOs/' + btcData.address)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys(['pages', 'utxos']);
                    res.body.pages.should.be.a('number');
                    res.body.utxos.should.be.a('array');
                    res.body.utxos.length.should.be.above(0);
                    if(res.body.utxos.length > 0) {
                        res.body.utxos[0].should.be.a('object');
                        res.body.utxos[0].should.have.all.keys(btcData.utoxsKeys);
                    }
                    done();
                });
        })
    });
    describe('/GET BTC getTransactionById', () => {
        it('it should GET Bitcoin raw transaction', done => {
            chai.request(server)
                .get('/api/v4.2/BTC/getTransactionById/' + btcData.transactionHash)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys(btcData.rawTransactionKeys);
                    done();
                });
        })
    });
    describe('/GET BTC getTransactionByRand', () => {
        it('it should GET Bitcoin raw transaction by rand', done => {
            chai.request(server)
                .get('/api/v4.2/BTC/getTransactionsListByRand/' + btcData.address + '/2/2')
                .end((err, res) => {
                    console.log('---', res.body );
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('transactions');
                    if (res.body.transactions.length > 0) {
                        res.body.transactions.should.have.all.keys('pending', 'transactions');
                        res.body.transactions.pending.should.be.a('array');
                        res.body.transactions.transactions.should.be.a('array');
                        res.body.transactions.transactions.length.should.be.below(0);
                        if (res.body.transactions.transactions.length > 0) {
                            res.body.transactions[0].should.be.a('object');
                            res.body.transactions[0].should.have.all.keys(btcData.transactionKeys_v42);
                        }
                    }
                    done();
                });
        })
    });
});
process.env.NODE_ENV = 'test';
const mongoose = require("mongoose");

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();
const bchData = {
    legacy: '16G3nBgH8cEWkcTiDuzjzMunhNwaSRwrQH',
    bitpay: 'CMiwME2M1fD3ekN8ufKfZsXpKW9zM4wwXy',
    cash: 'bitcoincash:qqumzvpteg66fskct2wwnph7gcrvaf0u6vjum6mwe3',
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

chai.use(chaiHttp);

describe('Bitcoin Cash', () => {
    describe('/GET BCH sendRawTransaction', () => {
        it('it should GET Bitcoin Cash transaction hash', done => {
            done();
        })
    });
    describe('/GET BCH getBalance', () => {
        it('it should GET Bitcoin Cash address balance', done => {
            chai.request(server)
                .get('/api/v4.0/BCH/getBalance/' + bchData.legacy)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('balance');
                    res.body.balance.should.be.a('number');
                    done();
                });
        })
    });
    describe('/GET BCH getUTXOs', () => {
        it('it should GET Bitcoin Cash address unspent transactions array', done => {
            chai.request(server)
                .get('/api/v4.0/BCH/getUTXOs/' + bchData.legacy)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('utxos');
                    res.body.utxos[0].should.be.a('object');
                    res.body.utxos[0].should.have.all.keys(bchData.utoxsKeys);
                    done();
                });
        })
    });
    describe('/GET BCH getTxList', () => {
        it('it should GET Bitcoin Cash address transactions array', done => {
            chai.request(server)
                .get('/api/v4.0/BCH/getTxList/' + bchData.legacy)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('txs');
                    res.body.txs[0].should.be.a('object');
                    res.body.txs[0].should.have.all.keys(bchData.transactionKeys);
                    done();
                });
        })
    });
});
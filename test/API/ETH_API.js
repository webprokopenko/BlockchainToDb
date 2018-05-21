process.env.NODE_ENV = 'test';
const mongoose = require("mongoose");

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const TEST_DATA = require('../test-data.json');

chai.use(chaiHttp);
describe('Ethereum', () => {
  describe('/GET ETH GasPrice', () => {
    it('it should GET Ethereum GasPrice', (done) => {
      chai.request(server)
        .get('/api/v4.0/ETH/getGasPrice')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.all.keys('gasPrice', 'gasPriceHex');
          done();
        });
    });
  });
  describe('/GET ETH GasLimit', () => {
    it('it should GET Ethereum GasLimit', (done) => {
      chai.request(server)
        .get('/api/v4.0/ETH/getGasLimit')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.all.keys('gasLimit', 'gasLimitHex');
          done();
        });
    });
  });
  describe('/GET ETH PriceLimit', () => {
    it('it should GET Ethereum PriceLimit', (done) => {
      chai.request(server)
        .get('/api/v4.0/ETH/getPriceLimit')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.all.keys('gasLimit', 'gasLimitHex', 'gasPrice', 'gasPriceHex');
          done();
        });
    });
  });
  describe('/GET ETH Transaction Count', () => {
    it('it should GET Ethereum Transaction Count', (done) => {
      chai.request(server)
        .get(`/api/v4.0/ETH/getTransactionCount/${TEST_DATA.wallet.addres}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('TransactionCount', TEST_DATA.wallet.transactionCount);
          done();
        });
    });
  });
  describe('/GET ETH Balance', () => {
    it('it should GET Ethereum Balance', (done) => {
      chai.request(server)
        .get(`/api/v4.0/ETH/getBalance/${TEST_DATA.wallet.addres}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('balance', TEST_DATA.wallet.balance);
          done();
        });
    });
  });
  describe('/GET ETH Transaction List', () => {
    it('it should GET Ethereum Transaction List by address', (done) => {
      chai.request(server)
        .get(`/api/v4.0/ETH/getTransactionsList/${TEST_DATA.wallet.addres}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.all.keys('in', 'out', 'pending_in', 'pending_out');
          done();
        });
    });
  });
  describe('/GET ETH Transaction from Hash', () => {
    it('it should GET Ethereum Transaction from Hash', (done) => {
      chai.request(server)
        .get(`/api/v4.0/ETH/getTransactionByHash/${TEST_DATA.wallet.TxHash}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.all.keys('blockHash','blockNumber','from','gas','gasPrice','hash','input','nonce','to','transactionIndex','value','v','r','s');
          done();
        });
    });
  });
  describe('/GET ETH Token Balance', () => {
        it('it should GET Ethereum address contract balance', (done) => {
            chai.request(server)
                .get(`/api/v4.0/ETH/getTokenBalance/${TEST_DATA.contract.validContract}/${TEST_DATA.contract.validAddress}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.all.keys('tokens');
                    done();
                });
        });
    });
});
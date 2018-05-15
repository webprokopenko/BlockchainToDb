process.env.NODE_ENV = 'test';
const mongoose = require("mongoose");

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const ETH_WALLET = {
  addres: '0xfD59158Bb5f3607ECc2ae19B2930520164310f67',
  balance: 1.996003156516914666,
  transactionCount: 37283
}

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
        .get(`/api/v4.0/ETH/getTransactionCount/${ETH_WALLET.addres}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('TransactionCount', ETH_WALLET.transactionCount);
          done();
        });
    });
  });
  describe('/GET ETH Balance', () => {
    it('it should GET Ethereum Balance', (done) => {
      chai.request(server)
        .get(`/api/v4.0/ETH/getBalance/${ETH_WALLET.addres}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('balance', ETH_WALLET.balance);
          done();
        });
    });
  });
});
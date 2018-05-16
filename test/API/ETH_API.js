process.env.NODE_ENV = 'test';
const mongoose = require("mongoose");

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const ETH_WALLET = {
  addres: 'efb8ab883ef70148bbb66ae7f3fce7039244f6e8',
  balance: 1.108410154065632,
  transactionCount: 8,
  TxHash: '0x186b9b57a415cceed9502248ff99fa6abc729da5baf7d238359aa31daaee212'
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
  describe('/GET ETH Transaction List', () => {
    it('it should GET Ethereum Transaction List by address', (done) => {
      chai.request(server)
        .get(`/api/v4.0/ETH/getTransactionsList/${ETH_WALLET.addres}`)
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
        .get(`/api/v4.0/ETH/getTransactionByHash/${ETH_WALLET.TxHash}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.all.keys('hash', 'timestamp', 'from', 'to', 'value','fee', 'blockNum');
          done();
        });
    });
  });
});
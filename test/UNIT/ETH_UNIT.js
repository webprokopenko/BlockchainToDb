const path = require('path');
global.appRoot = path.resolve(__dirname + '/../../');
const chai = require('chai');
const expect = chai.expect; // we are using the "expect" style of Chai
const ETHRpc = require('../../lib/ethereum/getETHRpc');
const utils = require(`${appRoot}/lib/ethereum/utilsETH`);

const ETH_WALLET = require('../wallet.json');

describe('ETHRpc',  async ()=> {
  it('getBlockData() should return data in block',  async ()=> {
    let BlockData =  await ETHRpc.getBlockData(1244073);
    expect(BlockData).to.include.all.keys('difficulty','extraData','gasLimit','gasUsed','hash','logsBloom',
        'miner','mixHash','nonce','number','parentHash','receiptsRoot','sha3Uncles','size','stateRoot','timestamp',
        'totalDifficulty','transactions','transactionsRoot','uncles');
  });
  it('getGasPrice() should return gas price in Ethereum',  async ()=> {
    let gasPrice =  await ETHRpc.getGasPrice();
    expect(utils.convertHexToInt(gasPrice)).to.be.an('string');
    expect(parseFloat(utils.convertHexToInt(gasPrice))).to.be.above(0);
  });
  it('getLatestBlock() should return last block in Ethereum',  async ()=> {
    let lastBlock =  await ETHRpc.getLatestBlock();
    expect(lastBlock).to.include.all.keys('difficulty','extraData','gasLimit','gasUsed','hash','logsBloom',
        'miner','mixHash','nonce','number','parentHash','receiptsRoot','sha3Uncles','size','stateRoot','timestamp',
        'totalDifficulty','transactions','transactionsRoot','uncles');
  });
  it('getBalance() should return balance of account',  async ()=> {
    let balance =  await ETHRpc.getBalance(ETH_WALLET.addres);
    expect(utils.convertHexToInt(balance)).to.be.equal(ETH_WALLET.balance);
  });
  
});
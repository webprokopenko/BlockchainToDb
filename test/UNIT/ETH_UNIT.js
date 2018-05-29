const path = require('path');
global.appRoot = path.resolve(__dirname + '/../../');
const chai = require('chai');
const expect = chai.expect; // we are using the "expect" style of Chai
const ETHRpc = require('../../lib/ethereum/getETHRpc');
const utils = require(`${appRoot}/lib/ethereum/utilsETH`);

const TEST_DATA = require('../test-data.json');

describe('ETHRpc', async () => {
    it('getBlockData() should return data in block', async () => {
        let BlockData = await ETHRpc.getBlockData(TEST_DATA.block.num);
        expect(BlockData).to.include.all.keys('difficulty', 'extraData', 'gasLimit', 'gasUsed', 'hash', 'logsBloom',
            'miner', 'mixHash', 'nonce', 'number', 'parentHash', 'receiptsRoot', 'sha3Uncles', 'size', 'stateRoot', 'timestamp',
            'totalDifficulty', 'transactions', 'transactionsRoot', 'uncles');
    });
    it('getGasPrice() should return gas price in Ethereum', async () => {
        let gasPrice = await ETHRpc.getGasPrice();
        expect(utils.convertHexToInt(gasPrice)).to.be.an('string');
        expect(parseFloat(utils.convertHexToInt(gasPrice))).to.be.above(0);
    });
    it('getLatestBlock() should return last block in Ethereum', async () => {
        let lastBlock = await ETHRpc.getLatestBlock();
        expect(lastBlock).to.include.all.keys('difficulty', 'extraData', 'gasLimit', 'gasUsed', 'hash', 'logsBloom',
            'miner', 'mixHash', 'nonce', 'number', 'parentHash', 'receiptsRoot', 'sha3Uncles', 'size', 'stateRoot', 'timestamp',
            'totalDifficulty', 'transactions', 'transactionsRoot', 'uncles');
    });
    it('getBalance() should return balance of account', async () => {
        let balance = await ETHRpc.getBalance(TEST_DATA.wallet.addres);
        expect(utils.convertHexToInt(balance)).to.be.equal(TEST_DATA.wallet.balance);
    });
    it('getTransactionCount() should return count transaction of account', async () => {
        let count = await ETHRpc.getTransactionCount(TEST_DATA.wallet.addres);
        expect(utils.convertHexToInt(count)).to.be.equal(TEST_DATA.wallet.transactionCount);
    });
    it('getTransactionFromHash() should return transaction from Hash', async () => {
        let count = await ETHRpc.getTransactionFromHash(TEST_DATA.wallet.TxHash);
        expect(count).include.keys('blockHash', 'blockNumber', 'from', 'gas', 'gasPrice', 'hash', 'input', 'nonce', 'to', 'transactionIndex', 'value', 'v', 'r', 's');
    });
    it('getTransactionCountETH() should return count of transaction in block', async () => {
        let count = await ETHRpc.getTransactionCountETH(TEST_DATA.block.num);
        expect(count).equal(5);
    });
    it('getTokens() should return balance of account in smart-contract ERC20', async () => {
        let tokens = await ETHRpc.getTokens(TEST_DATA.contract.validContract, TEST_DATA.contract.validAddress);
        expect(parseInt(tokens.toString())).to.be.equal(TEST_DATA.contract.balance);
    });
    it('getContractDecimals() should return decimals of smart-contract ERC20', async () => {
        let decimals = await ETHRpc.getContractDecimals(TEST_DATA.contract.validContract);
        expect(parseInt(decimals.toString())).to.be.a('number');
    });
});
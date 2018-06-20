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
    ],
    PendingTransaction: {
        'hash': 'a90dbee0f3c47b6bf98a906c40961bdf630bd08f820accd5294c6a7a94ba94b9',
        'hex': '0100000001ce8040049f5099ce975022ef4918c04225a63bea7826d08a1bfd4bae27efcbee010000006b483045022100fc4404ccdb70905fb1ed9c70ddc8e09f95a9c5a9090c1d8a0964f6a208e58fd3022044e39603e6373b017011871d1e1157af5d7abfb095d24f159629c7d6cde6111e012102bbbaad1c7e934fcbc6c5b624cfa1ac611e42fb690edef5b869116ebf76ea267fffffffff02b0300100000000001976a9145c850534fbe75f5a778d71a1eaf4ae8697b0201788ac082c3a0f000000001976a9147eaff793dff4a2ad111c32d763c8d5ae3a5b5f2b88ac00000000',
        'locktime': 0,
        'size': 226,
        'txid': 'a90dbee0f3c47b6bf98a906c40961bdf630bd08f820accd5294c6a7a94ba94b9',
        'version': 1,
        'vin': [
            {
                'scriptSig': {
                    'asm': '3045022100fc4404ccdb70905fb1ed9c70ddc8e09f95a9c5a9090c1d8a0964f6a208e58fd3022044e39603e6373b017011871d1e1157af5d7abfb095d24f159629c7d6cde6111e[ALL] 02bbbaad1c7e934fcbc6c5b624cfa1ac611e42fb690edef5b869116ebf76ea267f',
                    'hex': '483045022100fc4404ccdb70905fb1ed9c70ddc8e09f95a9c5a9090c1d8a0964f6a208e58fd3022044e39603e6373b017011871d1e1157af5d7abfb095d24f159629c7d6cde6111e012102bbbaad1c7e934fcbc6c5b624cfa1ac611e42fb690edef5b869116ebf76ea267f'
                },
                'sequence': 4294967295,
                'txid': 'eecbef27ae4bfd1b8ad02678ea3ba62542c01849ef225097ce99509f044080ce',
                'vout': 1
            }
        ],
        'vout': [
            {
                'n': 0,
                'scriptPubKey': {
                    'addresses': [
                        'mox9p7n3MPFqSXnzSD55c9YdEZo2gxWH1K'
                    ],
                    'asm': 'OP_DUP OP_HASH160 5c850534fbe75f5a778d71a1eaf4ae8697b02017 OP_EQUALVERIFY OP_CHECKSIG',
                    'hex': '76a9145c850534fbe75f5a778d71a1eaf4ae8697b0201788ac',
                    'reqSigs': 1,
                    'type': 'pubkeyhash'
                },
                'value': 0.00078
            },
            {
                'n': 1,
                'scriptPubKey': {
                    'addresses': [
                        'ms4pEdg3zu4cdy9yjye1BUta9mwNGMTKgD'
                    ],
                    'asm': 'OP_DUP OP_HASH160 7eaff793dff4a2ad111c32d763c8d5ae3a5b5f2b OP_EQUALVERIFY OP_CHECKSIG',
                    'hex': '76a9147eaff793dff4a2ad111c32d763c8d5ae3a5b5f2b88ac',
                    'reqSigs': 1,
                    'type': 'pubkeyhash'
                },
                'value': 2.554706
            }
        ],
        'vsize': 226
    }
};

describe('BTC RPC lib', async () => {
    it('sendRawTransaction', async () => {});
    it('getBlockCount', async () => {
        const blockCount = await BTCRpc.getBlockCount();
        expect(blockCount).to.be.an('number');
    });
    it('getBlockData', async () => {
        const data = await BTCRpc.getBlockData(btcData.blockHash);
        expect(data).to.be.an('object')
            .that.have.all.keys(btcData.blockKeys);
    });
    it('getBlockHash', async () => {
        const hash = await BTCRpc.getBlockHash(btcData.blockNum);
        expect(hash).to.be.an('string');
    });
    it('getTransactionsFromBlock', async () => {
        const txs = await BTCRpc.getTransactionsFromBlock(btcData.blockNum);
        expect(txs).to.be.an('array');
        expect(txs[0]).to.be.an('object')
            .that.have.all.keys(btcData.transactionKeys);
    });
    it('getBalance', async () => {
        const balance = await BTCRpc.getBalance('1FuXfSvK4UHFvjoTJjUxgnj9x2T3DujzjM');
        console.log('Balance :' + balance);
        expect(balance).to.be.an('number');
    });
    it('getUTXOs', async () => {
        const utxos = await BTCRpc.getUTXOs('1FuXfSvK4UHFvjoTJjUxgnj9x2T3DujzjM');
        expect(utxos).to.be.an('array');
        expect(utxos[0]).to.be.an('object')
            .that.have.all.keys(btcData.utoxsKeys);
    });
    it('getTxsByAddress', async () => {
        const txs = await BTCRpc.getTxsByAddress('1FuXfSvK4UHFvjoTJjUxgnj9x2T3DujzjM');
        expect(txs).to.be.an('array');
        expect(txs[0]).to.be.an('object')
            .that.have.all.keys(btcData.transactionKeys);
    });
    it('SavePendingTransaction', async () => {
        const tx = await mongodbLib.saveTempTransactionToMongoDb(testData.PendingTransaction);
        expect(tx).to.be.an('object');
    });
    


});

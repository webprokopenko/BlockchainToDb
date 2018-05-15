const path = require('path');
global.appRoot = path.resolve(__dirname);
global.appRoot = global.appRoot.replace('/test','');
global.mongoose = require('mongoose');
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
const bitcoin_cash = require('../lib/bitcoin_cash/getBCHbitcoin_cash');
const BCHmongo = require('../lib/mongodb/bchtransactions');
const db = require('../lib/db');

describe('Testing BCH',()=> {
    it('BCH::getBlockHash', (done) => {
        bitcoin_cash.getBlockHash(1225746)
            .then(block => {
                console.dir(block);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('BCH::getBlockData', (done) => {
        bitcoin_cash.getBlockData('000000007f0eaec313e119f8ba4ad2df1d9a617771058f25d65c1263bec75589')//'00000000000014e8a3d0a73fd53b8ea72871db1c7b0cb8bd367b41f12eb642cd')
            .then(block => {
                console.dir(block);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('BCH::getTransactionsFromBlock', (done) => {
        bitcoin_cash.getTransactionsFromBlock(487322)
            .then(txs => {
                console.dir(txs);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('BCH::getLastMongoBlock', (done) => {
        BCHmongo.getLastBlock()
            .then(txs => {
                console.dir(txs);
            })
            .catch(err => console.dir(err));
        done();
    });
});
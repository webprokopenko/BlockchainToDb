const path = require('path');
global.appRoot = path.resolve(__dirname);
global.appRoot = global.appRoot.replace('/test','');
global.mongoose = require('mongoose');
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
const ZECmongo = require('../lib/mongodb/zectransactions');
const db = require('../lib/db');
const zcash = require('../lib/zcash/getZECzcash');

describe('Testing ZEC',()=> {
    it('ZEC::getBlockHash', (done) => {
        zcash.getBlockHash(73362)
            .then(block => {
                console.dir(block);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('ZEC::getBlockData', (done) => {
        zcash.getBlockData('0000000048d286ab5833f68535b2140edc39c4746732c6b2ca52d371931596f8')
            .then(block => {
                console.dir(block);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('ZEC::getTransactionsFromBlock', (done) => {
        zcash.getTransactionsFromBlock(73362)
            .then(txs => {
                console.dir(txs);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('ZEC::getLastMongoBlock', (done) => {
        ZECmongo.getLastBlock()
            .then(txs => {
                console.dir(txs);
            })
            .catch(err => console.dir(err));
        done();
    });
});
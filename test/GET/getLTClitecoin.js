const path = require('path');
global.appRoot = path.resolve(__dirname);
global.appRoot = global.appRoot.replace('/test','');
const litecoin = require('../lib/litecoin/getLTClitecoin');
global.mongoose = require('mongoose');
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
const LTCmongo = require('../lib/mongodb/ltctransactions');
const db = require('../lib/db');

describe('Testing BTC',()=> {
    it('LTC::getBlockHash', (done) => {
        litecoin.getBlockHash(503315)
            .then(block => {
                console.dir(block);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('LTC::getBlockData', (done) => {
        litecoin.getBlockData('9bb740d5a0656d0488b6d557c25a229f665bd25abc648bdbe6e22d926eff4d1b')
            .then(block => {
                console.dir(block);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('LTC::getTransactionsFromBTC', (done) => {
        litecoin.getTransactionsFromBTC(487322)
            .then(txs => {
                console.dir(txs);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('LTC::getLastMongoBlock', (done) => {
        LTCmongo.getLastBlock()
            .then(txs => {
                console.dir(txs);
            })
            .catch(err => console.dir(err));
        done();
    });
});
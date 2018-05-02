const path = require('path');
global.appRoot = path.resolve(__dirname);
global.appRoot = global.appRoot.replace('/test','');
global.mongoose = require('mongoose');
const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
mongoose.connect(mongodbConnectionString);
const XMRmongo = require('../lib/mongodb/xmrtransactions');
const db = require('../lib/db');
const monero = require('../lib/monero/getXMRmonero');
const math = required('mathjs');

describe('Testing XMR',()=> {
    it('XMR::getBlockData', (done) => {
        monero.getBlockData(1558772)
            .then(block => {
                console.dir(block);
                console.dir(block.txs[0])
            })
            .catch(err => console.dir(err));
        done();
    });
    it('XMR::scanBlocks', (done) => {
        async function scan(start, finish) {
            const blockFill = [];
            for(let i = start; i <= finish; i++) {
                let blockData = await monero.getBlockData(i);
                console.dir(blockData);
                if (blockData.block_header.num_txes) blockFill.push(blockData);
            }
            return blockFill;
        }
        scan(1558772, 1558772)
            .then(bn => {
                console.log(bn.length);
                //done();
            });
        //console.log(blen);
        done();
    });
    it('XMR::getTransactionsFromBlock', (done) => {
        zcash.getTransactionsFromBlock(73362)
            .then(txs => {
                console.dir(txs);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('XMR::getLastMongoBlock', (done) => {
        ZECmongo.getLastBlock()
            .then(txs => {
                console.dir(txs);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('TEST MATHJS', done => {

        done();
    });
});
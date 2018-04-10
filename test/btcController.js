const path = require('path');
global.appRoot = path.resolve(__dirname);
global.appRoot = global.appRoot.replace('/test','');
const bitController = require('../controllers/btcController');
const db = require('../lib/db');

describe('Testing BTC',()=> {
    it('BTCcontroller::getBalance', (done) => {
        const addr = 'moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB';
        const stateDB = db.connect({
            db: {
                "name": "triumf",
                "user": "",
                "password": "",
                "host": "localhost",
                "port": 27017
            },
            log: console.log
        });
        if (stateDB) {
            bitController.getBalance(addr)
                .then(balance => console.log(balance))
                .catch(err => console.log(err));
            done();
        } else {
            console.log('Db connect error.');
            done();
        }
    });
    it('BTCcontroller::getUTXOs', (done) => {
        const addr = 'moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB';
        const stateDB = db.connect({
            db: {
                "name": "triumf",
                "user": "",
                "password": "",
                "host": "localhost",
                "port": 27017
            },
            log: console.log
        });
        if (stateDB) {
            bitController.getUTXOs(addr)
                .then(utxos => console.log(utxos))
                .catch(err => console.log(err));
            done();
        } else {
            console.log('Db connect error.');
            done();
        }
    });
    it('BTCcontroller::getTxsByAddress', (done) => {
        const addr = 'moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB';
        const stateDB = db.connect({
            db: {
                "name": "triumf",
                "user": "",
                "password": "",
                "host": "localhost",
                "port": 27017
            },
            log: console.log
        });
        if (stateDB) {
            bitController.getTxList(addr)
                .then(txs => console.log(txs))
                .catch(err => console.log(err));
            done();
        } else {
            console.log('Db connect error.');
            done();
        }
    });
    it('BTCcontroller::sendRawTx', (done) => {
        const hex = '010000000186d920cd4b4b970a7cae20f6f1d2a410fcef355f248963bfc8247433667f28ab010000006a47304402204ed6ec0581c6703d300fcbd6ebc16a604974b942c480c0c71e0c5b6bc46affeb0220329f63467c24823decdcfacd86a335796cd701b0d9edeff18b976759811dc93301210398198cccc87ec87beae3f3af87458a0331a12ac050ff1852d58fb09d8daf8ad1ffffffff0270640800000000001976a91435cb9ed8cd75dd3cc7ccb71892b887f102cf1ec688ac600c520c000000001976a91458294f2d6c832686bceeeb44987291a1e432dfbb88ac00000000';
        bitController.sendRawTransaction(hex)
            .then(txid => {
                console.dir(txid);
                done();
            })
            .catch(err => {
                console.dir(err);
                done();
            });
    });
});
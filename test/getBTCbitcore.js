const should = require('should'),
    //bitcoin = require('../lib/bitcoin/getBTCbitcoin');
insight = require('../lib/bitcoin/getBTCbitcore');
const db = require('../lib/db');
const BTCTxs = require('../models/BitcoinTransactionTestModel');

describe('Testing BTC',()=> {
    it('BTC::getAddressBalance', (done) => {
        insight.getBalance('moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB')
            .then(bal => {
                console.dir(bal);
            })
            .catch(err => console.dir(err));
            done();
    });
    it('BTC::getBalance', (done) => {
        bitcoin.getBalance('ms27DRoYW6nF78rEXvE3MRkZtLwrtz9CGJ')
            .then(bal => {
                console.log(`Balance: ${bal}`);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('BTC::getTxList', (done) => {
        insight.getTxList('ms27DRoYW6nF78rEXvE3MRkZtLwrtz9CGJ')
            .then(txList => {
                //console.dir(txList);
                txList.items.map(tx => {
                    console.dir(tx);
                    console.dir(tx.txid);
                    tx.vin.map(vn => {
                        console.dir(vn.txid);
                        console.dir(vn.scriptSig);
                    });
                    //console.dir(tx.vout);
                });
            })
            .catch(err => console.dir(err));
        done();
    });
    it('BTC::getTxById', (done) => {
        insight.getTxById('8924c888c817046d1f69d5bb24ff9de6281bd27bed27460f07f0316860345eca')
            .then(tx => {
                console.dir(tx);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('BTC::getUTXOs', (done) => {
        insight.getUTXOs('ms27DRoYW6nF78rEXvE3MRkZtLwrtz9CGJ')
            .then(utxos => {
                console.dir(JSON.parse(utxos));
            })
            .catch(err => console.dir(err));
        done();
    });
    it('BTC::sendRawTx', (done) => {
        const hex = '01000000012bd26b8a9b32bb58413ffef8cf515234509a1709afce80287d5a5c103139b1a7010000006a47304402203e1cfa022d78690e2dae3e4c06bffa89db25e394d543a66cee28ed4779a5161502203fa6949ecfce03a78475871dc1a9e45dfa1bcaab999f6716ab656018d6f6e80c01210398198cccc87ec87beae3f3af87458a0331a12ac050ff1852d58fb09d8daf8ad1ffffffff02a0860100000000001976a9142b6168b7002678a25e742149218302ca8e9b36ba88ac0ad7b004000000001976a91458294f2d6c832686bceeeb44987291a1e432dfbb88ac00000000';
        bitcoin.sendRawTransaction(hex)
            .then(txid => {
                console.dir(txid);
                done();
            })
            .catch(err => {
                console.dir(err);
                done();
            });
    });
    // hex 01000000012bd26b8a9b32bb58413ffef8cf515234509a1709afce80287d5a5c103139b1a7010000006a47304402203e1cfa022d78690e2dae3e4c06bffa89db25e394d543a66cee28ed4779a5161502203fa6949ecfce03a78475871dc1a9e45dfa1bcaab999f6716ab656018d6f6e80c01210398198cccc87ec87beae3f3af87458a0331a12ac050ff1852d58fb09d8daf8ad1ffffffff02a0860100000000001976a9142b6168b7002678a25e742149218302ca8e9b36ba88ac0ad7b004000000001976a91458294f2d6c832686bceeeb44987291a1e432dfbb88ac00000000
    // txid 8924c888c817046d1f69d5bb24ff9de6281bd27bed27460f07f0316860345eca

    //ebbdd217ec6f0842cfadc920a0c0f25f8c2fbac4634cd5abae1e00c0e8a252b9

    //03acdf9d7070a786d232086d33fcec3ea0dee235d88ddf0f435a5a56cdc3ee25
    //ff8250609db74e7166e0962aa5c6528087f7a0b514bae6d2edb05dc91c0bcb0b

    it('BTC::getBalanceLocal', (done) => {
        //insight.getUTXOs('moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB')ms27DRoYW6nF78rEXvE3MRkZtLwrtz9CGJ
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
            const cat1 = [],
                cat2 = [];
            BTCTxs.aggregate()
                .lookup({
                    from: 'btctransactions',
                    localField: 'vin.txid',
                    foreignField: 'txid',
                    as: 'txvin'
                })
                .project({
                    _id: 0,
                    blockhash: 1,
                    blockheight: 1,
                    txid: 1,
                    vin: {
                        txid: 1,
                        coinbase: 1
                    },
                    vout: 1,
                    txvin: 1
                })
                .match({
                        //{'vout.scriptPubKey.addresses': 'ms27DRoYW6nF78rEXvE3MRkZtLwrtz9CGJ'},
                        //{'txvin.vout.scriptPubKey.addresses': {$not:{$eq:'ms27DRoYW6nF78rEXvE3MRkZtLwrtz9CGJ'}}}
                        //{'vin.txid': {$exists: true}},
                        //{'txvin.vout': {$exists: true}},
                        //{'txvin.vout.scriptPubKey': {$exists: true}},
                        //{'txvin.vout.scriptPubKey.addresses': {$exists: true}},
                        //{'txvin.vout.scriptPubKey.addresses': 'ms27DRoYW6nF78rEXvE3MRkZtLwrtz9CGJ'},
                        'vout.scriptPubKey.addresses': addr
                })
                //.sort({'blockheight': -1})
                .limit(30)
                .exec()
                .then(txs => {
                    console.log('Total txs: ' + txs.length);
                    let indCat1 = true;
                    txs.map(tx => {
                        indCat1 = true;
                        //console.dir(tx.txvin.length);
                        for (let i = 0; i < tx.txvin.length; i++) {
                            tx.txvin[i].vout.map(tvout => {
                                //console.dir(tvout.scriptPubKey.addresses);
                                //console.log(tvout.scriptPubKey.addresses.indexOf('ms27DRoYW6nF78rEXvE3MRkZtLwrtz9CGJ'));
                                if(tvout.scriptPubKey.addresses.indexOf(addr) >= 0)
                                {
                                    cat2.push(tx);
                                    indCat1 = false;
                                    i = tx.txvin.length;
                                }
                            })
                        }
                        if (indCat1) cat1.push(tx);
                    });
                    console.log('Category 1: ' + cat1.length + ' Category 2:' + cat2.length);
                    let bal = 0;
                    cat1.map(c1 => {
                        BTCTxs.find()
                            .where({
                                'vin.txid':c1.txid
                            })
                            .limit(1)
                            .then(txc1 => {
                                let indSelf = false;
                                if (txc1.length > 0) txc1.map(txc => txc.vout.map(txcvout => {
                                    if(txcvout.scriptPubKey.addresses.indexOf(addr) >= 0)
                                        indSelf = true;
                                }));
                                if (txc1.length === 0 || indSelf) c1.vout.map(c1vout => {
                                    if(c1vout.scriptPubKey.addresses.indexOf(addr) >= 0) {
                                        bal += c1vout.value;
                                        //console.log(bal);
                                    }
                                });
                                cat2.sort((a,b) => {
                                    return a.blockheight - b.blockheight;
                                });
                                cat2[cat2.length - 1]
                                    .vout.map(cat2vout => {
                                        if(cat2vout.scriptPubKey.addresses.indexOf(addr) >= 0)
                                            bal += cat2vout.value;
                                    });
                                console.log(bal);
                                done();
                            })
                            .catch(e => console.log(e))
                    });
                    //done();
                })
                .catch(er => {
                    console.dir(er);
                    done();
                });
        } else {
            console.log('Db connect error.');
            done();
        }
    });
    it('BTC::getTxListLocal', (done) => {
        //insight.getUTXOs('moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB')
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
            BTCTxs
                .find()
                .where({
                    $and:[
                            {'vout.scriptPubKey.addresses': 'moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB'},
                            {'size': {$not:{$eq:'moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB'}}}
                        ]
                })
                .then(txs => {console.log(txs.length);
                    txs.map(tx => {
                        console.dir(tx.txid);
                    });
                    done();
                })
                .catch(er => {
                    console.dir(er);
                    done();
                });
        } else {
            console.log('Db connect error.');
            done();
        }
    });
});

//const mongoose = require('mongoose');
//mongoose.createConnection(require('../config/config.json').mongodbConnectionString);
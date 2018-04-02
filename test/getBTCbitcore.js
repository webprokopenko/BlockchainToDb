const should = require('should'),
    bitcoin = require('../lib/bitcoin/getBTCbitcoin'),
    insight = require('../lib/bitcoin/getBTCbitcore');

describe('Testing BTC',()=> {
    it('BTC::getAddressBalance', (done) => {
        insight.getBalance('moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB')
            .then(bal => {
                console.dir(bal);
            })
            .catch(err => console.dir(err));
            done();
    });
    it('BTC::getAddressTxList', (done) => {
        insight.getTXlist('moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB')
            .then(txList => {
                console.dir(txList);
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
        insight.getUTXOs('moZ7F9vZ9zXXnAZKDhMKFx9e8PYgjvDQbB')
            .then(utxos => {
                console.dir(utxos);
            })
            .catch(err => console.dir(err));
        done();
    });
    it('BTC::sendRawTx', (done) => {
        const hex = '01000000012bd26b8a9b32bb58413ffef8cf515234509a1709afce80287d5a5c103139b1a7010000006a47304402203e1cfa022d78690e2dae3e4c06bffa89db25e394d543a66cee28ed4779a5161502203fa6949ecfce03a78475871dc1a9e45dfa1bcaab999f6716ab656018d6f6e80c01210398198cccc87ec87beae3f3af87458a0331a12ac050ff1852d58fb09d8daf8ad1ffffffff02a0860100000000001976a9142b6168b7002678a25e742149218302ca8e9b36ba88ac0ad7b004000000001976a91458294f2d6c832686bceeeb44987291a1e432dfbb88ac00000000';
        bitcoin.sendRawTransaciton(hex)
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
});
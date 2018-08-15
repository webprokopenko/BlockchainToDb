const cote = require('cote');
const scanLibEth = require('../lib/scanBlockchain/scanETH');
const handlerErr = require(`../errors/HandlerErrors`);

const requester = new cote.Requester({ name: 'Requester' });
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber' });
requester.send({ type: 'start scan ETH' });
subscriber.on('update range ETH', (update) => {
    try {
        if (update.to - update.from < 100) {
            setTimeout(() => {
                scanLibEth.scan(update.from, update.to, (lastBlock) => {
                    requester.send({ type: 'start scan ETH', lastBLock: lastBlock });
                    scanLibEth.checkBadBlocks();
                });
            }, 60000);
        } else {
            scanLibEth.scan(update.from, update.to, (lastBlock) => {
                requester.send({ type: 'start scan ETH', lastBLock: lastBlock });
            });
        }
    } catch (error) {
        new handlerErr(error);
    }
});

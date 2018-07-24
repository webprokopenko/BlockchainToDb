if (!global.appRoot) {
    const path = require('path');
    global.appRoot = path.resolve(__dirname);
    global.appRoot = global.appRoot.replace('/microservices', '');
}
const cote = require('cote');
const scanLibEth = require('../lib/scanBlockchain/scanETH');
const handlerErr = require(`../errors/HandlerErrors`);

const requester = new cote.Requester({ name: 'Requester' });
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber' });

requester.send({ type: 'arbit action' });
subscriber.on('update range', (update) => {
    try {
        if (update.to - update.from < 100) {
            setTimeout(() => {
                scanLibEth.scan(update.from, update.to, (lastBlock) => {
                    requester.send({ type: 'arbit action', lastBLock: lastBlock });
                });
            }, 60000);
        } else {
            scanLibEth.scan(update.from, update.to, (lastBlock) => {
                requester.send({ type: 'arbit action', lastBLock: lastBlock });
            });
        }
    } catch (error) {
        new handlerErr(error);
    }
});
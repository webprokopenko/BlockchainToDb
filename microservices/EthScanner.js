const cote = require('cote');
const scanLibEth = require('../lib/scanBlockchain/scanETH');
const handlerErr = require(`../errors/HandlerErrors`);

const requester = new cote.Requester({ name: 'Requester' });
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber' });
requester.send({ type: 'StartScanETH' });
subscriber.on('UpdateRangeETH', (update) => {
    try {
        if (update.to - update.from < 100) {
            console.log('UPDATE RANGE < 100');
            setTimeout(() => {
                scanLibEth.scan(update.from, update.to, (lastBlock) => {
                    requester.send({ type: 'StartScanETH', lastBLock: lastBlock });
                    scanLibEth.checkBadBlocks(10, ()=>{
                        console.log('Finish check bad blocks');
                    })
                });
            }, 20000);
        } else {
            scanLibEth.scan(update.from, update.to, (lastBlock) => {
                requester.send({ type: 'StartScanETH', lastBLock: lastBlock });
            });
        }
    } catch (error) {
        new handlerErr(error);
    }
});

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

try {
    requester.send({ type: 'arbit action' }, (res) => { console.log(res); });

    subscriber.on('update range', (update) => {
        try {
            console.log(update.from);
            console.log(update.to);
            if(parseInt(update.to - update.from) < 10){
                setTimeout(
                    scanLibEth.saveBlockTransactionFromTo(update.from, update.to, 10, function(){
                        scanLibEth.checkBadBlocks(3, function(){
                            requester.send({ type: 'arbit action' }, (res) => { console.log(res); });
                        });
                    }),
                60000);
            }else{
                scanLibEth.saveBlockTransactionFromTo(update.from, update.to, 10, function(){
                    scanLibEth.checkBadBlocks(3, function(){
                        requester.send({ type: 'arbit action' }, (res) => { console.log(res); });
                    });
                });    
            }
        } catch (error) {
            new handlerErr(error);
        }
    });
} catch (error) {
    console.log(error);
}
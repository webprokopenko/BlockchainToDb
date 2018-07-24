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
            //saveBlockTransactionFromTo(update.from, update.to ,10);
            // scanLibEth.saveBlockTransactionFromTo(333000, 333300, 10, function(){
            //     console.log('Save block finish')
            // });    
            scanLibEth.checkBadBlocks(3);
        } catch (error) {
            new handlerErr(error);
        }
    });

    // getTransactionFromETH(300004)
    //     .then(data=>{
    //         console.log(data);
    //     })
    //     .catch(e=>{
    //         console.log(e);
    //     })

    //parseBadBlocks();
    //saveBlockTransactionFromTo(320140,320160,10);    
    //ScanLogModel.setStatusTrueLogByBlockId(300003);

} catch (error) {
    console.log(error);
}
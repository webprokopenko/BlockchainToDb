const cote = require('cote');
const scanBTC = require('../lib/scanBlockchain/scanBTC');
const requester = new cote.Requester({ name: 'Requester BTC' });
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber BTC' });

requester.send({ type: 'start scan BTC' });
subscriber.on('update range BTC', (update) => {
    console.log('subscriber update range BTC');
    try {
        console.log('Update from: ' + update.from + 'Update to: ' + update.to)
        if (update.to - update.from < 100) {
            setTimeout(() => {
                scanBTC.scan(update.from, update.to, (lastBlock)=>{
                    console.log('FINISH! SCAN LAST BLOCK: '+ lastBlock);
                    requester.send({ type: 'start scan BTC', lastBlock: lastBlock });
                    scanBTC.checkBadBlocks(10, () => {
                        console.log('Check bad blocks finish');
                    })
                    scanBTC.checkDBTransactionByBlockNum()
                        .then(data => {
                            console.log('Finish check DB')
                        })
                })
            }, 60000);
        } else {
            scanBTC.scan(update.from, update.to, (lastBlock) => {
                console.log('FINISH! SCAN LAST BLOCK: '+ lastBlock);
                requester.send({ type: 'start scan BTc', lastBlock: lastBlock });
            });
        }
    } catch (error) {
        new handlerErr(new scannerError(`BGoldScanner Error Message: ${error}`, 0, 'btc'));
    }
});
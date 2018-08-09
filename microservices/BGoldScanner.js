const cote = require('cote');
const scanBTG = require('../lib/scanBlockchain/scanBTG');
const requester = new cote.Requester({ name: 'Requester BTG' });
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber BTG' });

requester.send({ type: 'start scan BTG' });
subscriber.on('update range BTG', (update) => {
    console.log('subscriber update range BTG');
    try {
        console.log('Update from: ' + update.from + 'Update to: ' + update.to)
        if (update.to - update.from < 100) {
            setTimeout(() => {
                scanBTG.scan(update.from, update.to, (lastBlock)=>{
                    console.log('FINISH! SCAN LAST BLOCK: '+ lastBlock);
                    requester.send({ type: 'start scan BTG', lastBlock: lastBlock });
                    scanBTG.checkBadBlocks(10, () => {
                        console.log('Check bad blocks finish');
                    })
                    scanBTG.checkDBTransactionByBlockNum()
                        .then(data => {
                            console.log('Finish check DB')
                        })
                })
            }, 60000);
        } else {
            scanBTG.scan(update.from, update.to, (lastBlock) => {
                console.log('FINISH! SCAN LAST BLOCK: '+ lastBlock);
                requester.send({ type: 'start scan BTG', lastBlock: lastBlock });
            });
        }
    } catch (error) {
        new handlerErr(new scannerError(`BGoldScanner Error Message: ${error}`, 0, 'btg'));
    }
});
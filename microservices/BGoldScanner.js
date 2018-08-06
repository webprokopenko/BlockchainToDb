const cote = require('cote');
const BitKind = require('../lib/BitKind');
const config = require('../config/config.json').BTGRpc;
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(require('../config/config.json').mongodbConnectionString);
//BTG
const BTGTransactionLib = require('../lib/mongodb/btgtransactions');
const BGOLD = new BitKind(config, BTGTransactionLib, 'btg');

const requester = new cote.Requester({ name: 'Requester BTG' });
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber BTG' });

requester.send({ type: 'start scann' });
subscriber.on('update range', (update) => {
    try {
        console.log('Update from: ' + update.from + 'Update to: ' + update.to)
        if (update.to - update.from < 100) {
            setTimeout(() => {
                BGOLD.scan(update.from, update.to, (lastblock)=>{
                    console.log('FINISH! SCAN LAST BLOCK: '+ lastblock);
                    requester.send({ type: 'start scan', lastBLock: lastBlock });
                })
            }, 60000);
        } else {
            scanLibEth.scan(update.from, update.to, (lastBlock) => {
                console.log('FINISH! SCAN LAST BLOCK: '+ lastblock);
                requester.send({ type: 'start scan', lastBLock: lastBlock });
            });
        }
    } catch (error) {
        new handlerErr(error);
    }
});
const cote = require('cote');

const requester = new cote.Requester({name: 'Requester'});

requester.send({type:'getBlockNumber', blockNum: 500000}, (res) => {
    console.log('Requester send data to responder getBlockNumber');
    console.log(res);
})
requester.send({type:'getGasPrice'}, (res) => {
    console.log('Requester send data to responder getGasPrice');
    console.log(res);
})
requester.send({type:'getLatestBlock'}, (res) => {
    console.log('Requester send data to responder getLatestBlock');
    console.log(res);
})

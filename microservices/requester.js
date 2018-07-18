const cote = require('cote');

const requester = new cote.Requester({name: 'Requester'});
requester.send({type:'getBlockData', blockNum: 300000}, (res) => {
    console.log('Requester send data to responder getBlockData');
    console.log(res);
});
// requester.send({type:'getBlockNumber', blockNum: 500000}, (res) => {
//     console.log('Requester send data to responder getBlockNumber');
//     console.log(res); 
// })
// requester.send({type:'getGasPrice'}, (res) => {
//     console.log('Requester send data to responder getGasPrice');
//     console.log(res);
// })
// requester.send({type:'getLatestBlock'}, (res) => {
//     console.log('Requester send data to responder getLatestBlock');
//     console.log(res);
// })
// requester.send({type:'getBalance', address: '0xb4016d8ca33ab5970b1acdc3fb9a63a123a30638'}, (res) => {
//     console.log('Requester send data to responder getBalance');
//     console.log(res);
// })
// requester.send({type:'getTransactionCount', address: '0xb4016d8ca33ab5970b1acdc3fb9a63a123a30638'}, (res) => {
//     console.log('Requester send data to responder getTransactionCount');
//     console.log(res);
// });
// requester.send({type:'sendRawTransaction', rawTransaction: 'raw Transaction'}, (res) => {
//     console.log('Requester send data to responder sendRawTransaction');
//     console.log(res);
// });
// requester.send({type:'getTransactionFromHash', trHash: '0xb4016d8ca33ab5970b1acdc3fb9a63a123a30638'}, (res) => {
//     console.log('Requester send data to responder getTransactionFromHash');
//     console.log(res);
// });


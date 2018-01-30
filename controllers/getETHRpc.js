const rpc = require('node-json-rpc');
const util = require('util');
const Units = require('ethereumjs-units');

function convertNumberToHex(num){
    return `0x${num.toString(16)}`
}
function convertHexToInt(hex){
    return `${parseInt(hex, 16)}`
}
opts = {
    port:8545,
    host:'127.0.0.1',
    path:'/',
    strict:true
},
clientRPC = new rpc.Client(opts);
let numBlock = 405670;
clientRPC.call(
    {   'jsonrpc': '2.0',
        'method':'eth_getBlockByNumber',
        'params':[convertNumberToHex(numBlock), true],
        'id':1
    },
    (err,res)=>{
        if(err)
            return console.error(`Error from geth: ${err}`);
        if(!res)
            return console.error(`Response body empty`);
        if(res.error)
            return console.error(`Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`);
        if(!res.result.transactions)
            return console.error(`Transactions empty`);

        console.log(convertHexToInt(res.result.number));

        res.result.transactions.forEach(element=>{
            console.log(`Value:  ${Units.convert(convertHexToInt(element.value),'wei','eth')} From: ${element.from} To: ${element.to} Date: ${convertHexToInt(res.result.timestamp)}`);
        });
    }
);

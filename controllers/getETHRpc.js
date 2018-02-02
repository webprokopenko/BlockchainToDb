const rpc = require('node-json-rpc');
const util = require('util');
const Units = require('ethereumjs-units');
const math = require('mathjs');
opts = {
    port:8546,
    host:'127.0.0.1',
    path:'/',
    strict:true
},
clientRPC = new rpc.Client(opts);

function convertNumberToHex(num){
    return `0x${num.toString(16)}`
}
function convertHexToInt(hex){
    return `${parseInt(hex, 16)}`
}
function getGasFromTransactionHash(hash){
    return new Promise((resolve,reject)=>{
        clientRPC.call(
            {   'jsonrpc': '2.0',
                'method':'eth_getTransactionReceipt',
                'params':[hash],
                'id':1
            },
            (err,res)=>{
                if(err)
                    return reject(err)
                if(!res)
                    return reject(new Error(`Response body empty`));
                if(res.error)
                    return reject(new Error(`Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if(!res.result)
                    return reject(new Error(`Result body empty`))
                if(!res.result.gasUsed)
                    return reject(new Error('Result gasUsed from transaction empty'))
                
                resolve(convertHexToInt(res.result.gasUsed));
            }
        )
    })
}
module.exports = async function getTransactionFromETH(numBlock){
        try{
            const blockData = await getBlockData(numBlock);
            let blockTransaction = {
                block:      parseInt(convertHexToInt(blockData.number)),
                timestamp:  convertHexToInt(blockData.timestamp),
                transactions:[] 
            };
            await Promise.all(blockData.transactions.map(async (element, i) => {
                let transaction={};
                transaction.from = element.from;
                transaction.to = element.to;
                transaction.value = Units.convert(convertHexToInt(element.value),'wei','eth');
                transaction.fee = Units.convert((convertHexToInt(element.gas) * convertHexToInt(element.gasPrice)),'wei','eth');
                transaction.hash = element.hash;
                transaction.gasUse = math.bignumber(await getGasFromTransactionHash(element.hash));
                transaction.gasPrice = math.bignumber(Units.convert(convertHexToInt(element.gasPrice), 'wei', 'eth'));
                transaction.fee = math.multiply(transaction.gasPrice, transaction.gasUse).toFixed();
                transaction.gasUse = transaction.gasUse.toFixed();
                transaction.gasPrice = transaction.gasPrice.toFixed();

                blockTransaction.transactions.push(transaction);
            }));
             return blockTransaction;
            
        }catch(e){
            console.log(e);
        }           
}
module.exports.getBlockNumber = function getBlockNumber(param){
    return new Promise((resolve,reject)=>{
        if(!param || (param!=='latest' && param!='pending'))
            return reject(new Error(`function getBlockNumber missin param`));
        clientRPC.call(
            {   'jsonrpc': '2.0',
                'method':'eth_getBlockByNumber',
                'params':[param, true],
                'id':1
            },
            (err,res)=>{
                if(err)
                    return reject(new Error(`getBlockNumber Error from geth: ${err}`));
                if(!res)
                    return reject(new Error(`getBlockNumber Response body empty`));
                if(res.error)
                    return reject(new Error(`getBlockNumber Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if(!res.result.number)
                    return reject(new Error(`getBlockNumber Block number empty`))
                
                resolve(parseInt(convertHexToInt(res.result.number)));
            }        
        )
    })
}
module.exports.getBlockData = function getBlockData(numBlock){
    return new Promise((resolve,reject)=>{
        clientRPC.call(
            {   'jsonrpc': '2.0',
                'method':'eth_getBlockByNumber',
                'params':[convertNumberToHex(numBlock), true],
                'id':1
            },
            (err,res)=>{
                if(err)
                    return reject(new Error(`Error from geth: ${err}`));
                if(!res)
                    return reject(new Error(`Response body empty`));
                if(res.error)
                    return reject(new Error(`Error from command geth  Message: '${res.error.message}'  Code: ${res.error.code}`));
                if(!res.result.transactions)
                    return reject(new Error(`Transactions empty`))
                
                resolve(res.result);
            }        
        )
    })
}
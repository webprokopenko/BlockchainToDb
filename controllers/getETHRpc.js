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
function getBlockData(numBlock){
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
async function getTransactionFromETH(numBlock){
        try{
            const blockData = await getBlockData(numBlock);
            let blockTransaction = {
                block:      convertHexToInt(blockData.number),
                timestamp:  convertHexToInt(blockData.timestamp),
                transactions:[] 
            };
            await Promise.all(blockData.transactions.map(async (element, i) => {
                console.log(convertHexToInt(element.gas));
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
             console.log(blockTransaction);
            
        }catch(e){
            console.log(e);
        }
            
}
getTransactionFromETH(405755);


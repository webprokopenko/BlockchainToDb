const http = require('http');
const pid = process.pid;

http.createServer((req, res) => {
    for(let i = 1e7; i>0; i--){
        console.log(`Heandling request from ${pid}`);
        res.end(`Hello from ${pid}\n`);
    }
}).listen(8083,()=>{
    console.log(`Started ${pid}`);
})
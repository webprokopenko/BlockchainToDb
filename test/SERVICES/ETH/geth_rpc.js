const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);

global.appRoot = path.resolve(__dirname + '/../../../');

const rpcConfig = require(appRoot + '/config/config.json').ETHRpc;

app.use(bodyParser.json({}));

require(appRoot + '/test/SERVICES/ETH/geth_router')(app);

app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({error: err.message, code: err.codeErr});
});

server.listen(rpcConfig.port);
server.on('error', error => {
    console.log('ERROR Ethereum test RPC service: ' + error)
});
server.on('listening', () => {
    console.log('Ethereum test RPC service start on: ' + (server.address() === 'string'
        ? 'pipe ' + server.address()
        : 'port ' + server.address().port))
});

module.exports = app;
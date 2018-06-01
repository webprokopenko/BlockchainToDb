const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
//set global AppDirectory
global.appRoot = path.resolve(__dirname + '/../../../');

global.rpcConfig = require(appRoot + '/config/config.json').BCHRpc;
// body parser set
app.use(bodyParser.json({}));

// rpc routes
require(appRoot + '/test/SERVICES/BCH/bitcash_router')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function(err, req, res, next) {
    //render the error page
    res.status(err.status || 500);
    res.send({error: err.message, code: err.codeErr});
});

server.listen(rpcConfig.port);
server.on('error', error => {
    console.log('ERROR BitcoinCash test RPC service: ' + error)
});
server.on('listening', () => {
    console.log('BitcoinCash test RPC service start on: ' + (server.address() === 'string'
    ? 'pipe ' + server.address()
    : 'port ' + server.address().port))
});

module.exports = app;
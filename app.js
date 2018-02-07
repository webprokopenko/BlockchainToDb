const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const http = require('http');
const server = http.createServer(app);
const mongoose = require('mongoose');

global.mongoose = (global.mongoose ? global.mongoose : mongoose.createConnection('mongodb://root:root@ds211588.mlab.com:11588/eth_scan'));
// body parser set
app.use(bodyParser.json({ type: 'text/plain' }));
app.use(bodyParser.urlencoded({extended: false}));
//static file
app.use(express.static(path.join(__dirname, 'public')));
// add routes
require('./routes')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err); 
});

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500); 
  //res.render('error', { message: err.message, error: err });
});

server.listen(process.env.PORT || 2343, function() {
  console.log('Сервер запущен на порте: ' + server.address().port);
});

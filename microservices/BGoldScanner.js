const BitKind = require('../lib/BitKind');
const config = require('../config/config.json').BTGRpc;

const mongodbConnectionString = require('../config/config.json').mongodbConnectionString;
//Mongoose
global.mongoose = require('mongoose');
mongoose.connect(mongodbConnectionString);
require('../models/BitcoinGoldTransactionModel');
BTGTransaction = mongoose.model('btgtransactions');

const BGOLD = new BitKind(config, '../models/BitcoinGoldTransactionModel',BTGTransaction );
BGOLD.getBlockCount().then(data=>{
    console.log('DATA!!!:' + data);
}).catch(error=>{
    console.log('ERROR!!!' + error);
})
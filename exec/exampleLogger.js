// var intel = require('intel');
// intel.addHandler(new intel.handlers.File('../logs/transactionsToDb/eror.log'));
 
// intel.error('going to a file!');

// var log = require('intel').getLogger('foo.bar.baz');
// log.setLevel(log.INFO).warn('baz reporting in');

const intel = require('intel');
let LoggerTransactionToDbError = intel.getLogger('transactionsToDbError');
let LoggerTransactionToDbBadBlock = intel.getLogger('transactionsToDbBadBlock');

LoggerTransactionToDbBadBlock.setLevel(LoggerTransactionToDbBadBlock.INFO).addHandler(new intel.handlers.File('../logs/transactionsToDb/badblock.log'));
LoggerTransactionToDbBadBlock.error('bad block 1');

LoggerTransactionToDbError.setLevel(LoggerTransactionToDbError.ERROR).addHandler(new intel.handlers.File('../logs/transactionsToDb/eror.log'));
LoggerTransactionToDbError.error('error errror from transction to db');
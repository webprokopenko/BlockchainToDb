let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ScanLog = new Schema({
    blockchain:   String,
    errorMessage:   String,
    dateTimeError:  String,
    dateLastScan:   String,
    blockNum:       {
        type: Number,
        index: { unique: true }
    },
    status:         Boolean
});

module.export = mongoose.model('ScanLog', ScanLog);
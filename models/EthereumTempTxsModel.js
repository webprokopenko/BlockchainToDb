let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BlockTransaction = new Schema({
    hash: {
        type: String,
        index: { unique: true }
    },
    timestamp:  String,
    from:       {
        type: String,
        index: { unique: true }
    },
    to:         {
        type: String,
        index: { unique: true }
    },
    value:      String,
    fee:        String,
    blockNum:   Number
});

module.export = mongoose.model('ethtemptxs', BlockTransaction);
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
        index: { unique: false }
    },
    to:         {
        type: String,
        index: { unique: false }
    },
    value:      String,
    blockNum:   Number
});

module.export = mongoose.model('ethtemptxs', BlockTransaction);
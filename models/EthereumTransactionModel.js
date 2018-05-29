let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BlockTransaction = new Schema({
    hash: {
        type: String,
        index: { unique: true }
    },
    timestamp:  String,
    from:       String,
    to:         String,
    value:      String,
    fee:        String,
    blockNum:   Number,
    input: {
        to:     String,
        value:  String,
        from:   String
    },
    status:     Boolean
});

module.export = mongoose.model('ethtransactions', BlockTransaction);
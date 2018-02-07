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
});

mongoose.model('ethtransactions', BlockTransaction);
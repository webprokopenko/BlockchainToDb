let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BlockTransaction = new Schema({
    block:{
        type: Number
    },
    timestamp:{
        type: Timestamp
    },
    transactions:[{ 
        from:       String, 
        to:         String,
        value:      String,
        fee:        String,
        hash:       String,
        gasUse:     String,
        gasPrice:   String 
    }]
});

mongoose.model('blockTransaction', BlockTransaction);
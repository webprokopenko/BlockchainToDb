let Schema = mongoose.Schema;

let BlockTransaction = new Schema({
    block:{
        type: Number,
        index: { unique: true }
    },
    timestamp:{
        type: String
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
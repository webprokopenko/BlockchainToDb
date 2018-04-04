let Schema = mongoose.Schema;

let BlockTransaction = new Schema({
    blockheight:{
        type:           Number,
        index:          { unique: true }
    },
    blockhash:{
        type:           String,
        index:          { unique: true }
    },
    timestamp:{
        type:           String,
        index:          { unique: true }
    },
    txid:{
        type:           String,
        index:          { unique: true }
    },
    version:            Number,
    locktime:           Number,
    size:               Number,
    vin: [{
        txid:{
            type:       String,
            index:      true
        },
        vout:           Number,
        scriptSig: {
            asm:        String,
            hex:        String
        },
        sequence:       Number
    }],
    vout: [{
        value:          Number,
        n:              Number,
        scriptPubKey: {
            asm:        String,
            hex:        String,
            reqSigs:    Number,
            type:       String,
            addresses:{
                type:   [String],
                index:  true
            }
        }
    }]
});

mongoose.model('blockTransaction', BlockTransaction);
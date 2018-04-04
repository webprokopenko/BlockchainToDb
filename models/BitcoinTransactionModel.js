let Schema = mongoose.Schema;

let BitcoinTransaction = new Schema({
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
        coinbase:       String,
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

mongoose.model('btctransactions', BitcoinTransaction);
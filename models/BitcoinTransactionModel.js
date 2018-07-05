let Schema = mongoose.Schema;

let BitcoinTransaction = new Schema({
    blockheight:{
        type:           Number,
        index:          { unique: false }
    },
    blockhash:{
        type:           String,
        index:          { unique: false }
    },
    timestamp:{
        type:           String,
        index:          { unique: false }
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
        value:          Number,
        addresses:      [String],
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
            reqSigs:    String,
            tipe:       String,
            addresses:{
                type:   [String],
                index:  true
            }
        }
    }]
});

mongoose.model('btctransactions', BitcoinTransaction);
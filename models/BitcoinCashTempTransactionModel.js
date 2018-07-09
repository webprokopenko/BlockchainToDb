let Schema = mongoose.Schema;

let BitcoinCashTransaction = new Schema({
    txid:{
        type:           String,
        index:          { unique: true }
    },
    version:            Number,
    locktime:           Number,
    size:               Number,
    vin: [{
        txid:{
            type:       String
        },
        addresses:      [String],
        value:          Number,
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

mongoose.model('bchtmptxs', BitcoinCashTransaction);
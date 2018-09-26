let Schema = mongoose.Schema;

let BitcoinGoldTransaction = new Schema({
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
        vout:           Number,
        addresses:      {
            type:   [String],
            index: { unique: false } 
        },
        value:          Number,
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
                index: { unique: false }
            }
        }
    }]
});

mongoose.model('btctmptxs', BitcoinGoldTransaction);
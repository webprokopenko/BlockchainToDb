let Schema = mongoose.Schema;

let MoneroTransaction = new Schema({
    blockheight:{
        type:           Number,
        index:          { unique: false }
    },
    timestamp:{
        type:           String,
        index:          { unique: false }
    },
    hash:{
        type:           String,
        index:          { unique: true }
    },
    version:            Number,
    unlock_time:        Number,
    extra:              String,
    vin: [{
        key:{
            amount:     Number,
            k_image:    String,
            key_offsets:[Number]
        }
    }],
    vout: [{
        amount:         Number,
        target:{
            key:        String
        }
    }],
    fee:                String,
    mixin:              Number,
    size:               Number,
    rct_signatures:{
        ecdhInfo:[{
            amount:     String,
            mask:       String
        }],
        outPk:          [String],
        txnFee:         String,
        tipe:           Number
    },
    rctsig_prunable:{
        MGs:[{
            cc:         String,
            ss:[
                [
                    String,
                    String
                ]
            ]
        }],
        rangeSigs:[{
            Ci:     String,
            asig:   String
        }]
    }
});

mongoose.model('xmrtransactions', MoneroTransaction);
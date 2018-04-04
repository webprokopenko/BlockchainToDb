let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let Exchange = new Schema({
    time:   Number,
    market: String,
    pair:   String,
    low:    Number,
    high:   Number,
    open:   Number,
    close:  Number
});
Exchange.index({time: 1, pair: 1}, {unique: true});
Exchange.index({market:1}, {unique: false});

module.export = mongoose.model('exchange', Exchange);
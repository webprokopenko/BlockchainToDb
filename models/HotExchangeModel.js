let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let HotExchange = new Schema({
    time:   Number,
    pair:   String,
    value:  Number,
});
HotExchange.index({time: 1, pair: 1}, {unique: true});

module.export = mongoose.model('hot_exchange', HotExchange);
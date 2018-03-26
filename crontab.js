const hotExchange = require('./exec/HotExchange');

function run(){
    setInterval(hotExchange.parseAndSaveETHUSD, 3600000); //60 minutes
}
module.exports.run = run;
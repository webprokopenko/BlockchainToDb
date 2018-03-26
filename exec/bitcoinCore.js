const Client = require('bitcoin-core');
const client = new Client(require(`../config/config.json`).BTCRpc);

const balance = client.getBalance({
    account: 'mqdofsXHpePPGBFXuwwypAqCcXi48Xhb2f',
    minconf: 0
  });

client.getInfo().then((help) => console.log(help));
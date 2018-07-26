const cote = require('cote');

const responder = new cote.Responder({ name: 'currency conversion responder' });
const subscriber = new cote.Subscriber({ name: 'arbitration subscriber' });

const rates = { usd_eur: 0.91, eur_usd: 1.10 };

responder.on('convert', (req, cb) => {
    cb(req.amount * rates[`${req.from}_${req.to}`]);
});

subscriber.on('update rate', (update) => {
    rates[update.currencies] = update.rate;
});
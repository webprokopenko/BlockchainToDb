const express = require('express');
const app = module.exports = express();
const statsController = require(`${appRoot}/controllers/statsController`);

app.get('/BTC-USD/GDAX/:countMonths', (req, res) => {
    const countMonths = req.params.countMonths;
    statsController.getGdaxBtcUsd(countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.send(`${error}`);
        })
});
app.get('/BTC-EUR/GDAX/:countMonths', (req, res) => {
    const countMonths = req.params.countMonths;
    statsController.getGdaxBtcEur(countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.send(`${error}`);
        })
});

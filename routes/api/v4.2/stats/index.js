const express = require('express');
const request = require('request');
const app = module.exports = express();
const statsController = require(`../../../../controllers/statsController`);

app.get('/:pair', (req, res, next) => {
    const pair = req.params.pair;
    statsController.getHotExchange(pair)
        .then((data) => {
            res.send(data);
        })
        .catch(error => {
            next(error);
        });
});
app.get('/BTC-USD/GDAX/all', (req, res, next) => {
    statsController.getGdaxAll('BTC-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-USD/GDAX/week', (req, res, next) => {
    statsController.getGdaxWeek('BTC-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-USD/GDAX/day', (req, res, next) => {
    statsController.getGdaxDay('BTC-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-USD/GDAX/:countMonths', (req, res, next) => {
    const countMonths = req.params.countMonths;
    statsController.getGdax('BTC-USD', countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-EUR/GDAX/all', (req, res, next) => {
    statsController.getGdaxAll('BTC-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-EUR/GDAX/week', (req, res, next) => {
    statsController.getGdaxWeek('BTC-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-EUR/GDAX/day', (req, res, next) => {
    statsController.getGdaxDay('BTC-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-EUR/GDAX/:countMonths', (req, res, next) => {
    const countMonths = req.params.countMonths;
    statsController.getGdax('BTC-EUR', countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-USD/GDAX/all', (req, res, next) => {
    statsController.getGdaxAll('ETH-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-USD/GDAX/week', (req, res, next) => {
    statsController.getGdaxWeek('ETH-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-USD/GDAX/day', (req, res, next) => {
    statsController.getGdaxDay('ETH-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-USD/GDAX/:countMonths', (req, res, next) => {
    const countMonths = req.params.countMonths;
    statsController.getGdax('ETH-USD',countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-EUR/GDAX/all', (req, res, next) => {
    statsController.getGdaxAll('ETH-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-EUR/GDAX/week', (req, res, next) => {
    statsController.getGdaxWeek('ETH-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-EUR/GDAX/day', (req, res, next) => {
    statsController.getGdaxDay('ETH-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-EUR/GDAX/:countMonths', (req, res, next) => {
    const countMonths = req.params.countMonths;
    statsController.getGdax('ETH-EUR',countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error);
        })
});
app.get('/BTC-USD/BITFINEX/all', (req, res, next) => {
    statsController.getBitfinexAll('BTC-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-USD/BITFINEX/week', (req, res, next) => {
    statsController.getBitfinexWeek('BTC-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-USD/BITFINEX/day', (req, res, next) => {
    statsController.getBitfinexDay('BTC-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-USD/BITFINEX/:countMonths', (req, res, next) => {
    const countMonths = req.params.countMonths;
    statsController.getBitfinex('BTC-USD', countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-EUR/BITFINEX/all', (req, res, next) => {
    statsController.getBitfinexAll('BTC-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-EUR/BITFINEX/week', (req, res, next) => {
    statsController.getBitfinexWeek('BTC-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-EUR/BITFINEX/day', (req, res, next) => {
    statsController.getBitfinexDay('BTC-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/BTC-EUR/BITFINEX/:countMonths', (req, res, next) => {
    const countMonths = req.params.countMonths;
    statsController.getBitfinex('BTC-EUR', countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-USD/BITFINEX/all', (req, res, next) => {
    statsController.getBitfinexAll('ETH-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-USD/BITFINEX/week', (req, res, next) => {
    statsController.getBitfinexWeek('ETH-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-USD/BITFINEX/day', (req, res, next) => {
    statsController.getBitfinexDay('ETH-USD')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-USD/BITFINEX/:countMonths', (req, res, next) => {
    const countMonths = req.params.countMonths;
    statsController.getBitfinex('ETH-USD',countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-EUR/BITFINEX/all', (req, res, next) => {
    statsController.getBitfinexAll('ETH-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-EUR/BITFINEX/week', (req, res, next) => {
    statsController.getBitfinexWeek('ETH-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-EUR/BITFINEX/day', (req, res, next) => {
    statsController.getBitfinexDay('ETH-EUR')
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error)
        })
});
app.get('/ETH-EUR/BITFINEX/:countMonths', (req, res, next) => {
    const countMonths = req.params.countMonths;
    statsController.getBitfinex('ETH-EUR',countMonths)
        .then(list => {
            res.send(list);
        })
        .catch(error => {
            next(error);
        })
});
app.get('/markets', (req, res, next)=>{
    let markets = [
        {'market':'BITFINEX','pair':'BTC-USD'},
        {'market':'BITFINEX','pair':'ETH-USD'},
        {'market':'GDAX','pair':'BTC-USD'},
        {'market':'GDAX','pair':'BTC-EUR'},
        {'market':'GDAX','pair':'ETH-USD'},
        {'market':'GDAX','pair':'ETH-EUR'},
    ]
    res.send(markets);
})

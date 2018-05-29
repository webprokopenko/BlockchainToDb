const response = {
    jsonrpc: '2.0',
    id: 1
};
const bodyParser = function(req, res, next) {
    try {
        if(!req.body.id
            || !req.body.method
            || !req.body.params
            || !methods[req.body.method]) {
            throw Error();
        } else next();
    } catch (error) {
        response.error = 'Wrong request body';
        res.status(500).send(response);
    }
};
const methods = require(appRoot + '/test/SERVICES/ETH/geth_methods');
module.exports = (app) => {
    app.get('/', (req, res) => {
        res.status(404).send('TEST GETH RPC SERVICE')
    });
    app.post('/', bodyParser, (req, res) => {
        try {
            const resp = Object.assign({}, response);
            resp.result = methods[req.body.method](req.body.params);
            resp.id = req.body.id;
            res.send(resp);
        } catch (error) {
            response.error = error.message;
            res.status(500).send(response);
        }
    });

};
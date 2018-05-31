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
        } else {
            if(rpcConfig.user && rpcConfig.pass && rpcConfig.pass.length) {
                const auth = Buffer.from(req.headers.authorization.split(' ')[1],
                    'base64').toString(),
                    user = auth.split(':')[0],
                    pass = auth.split(':')[1];
                if (user === rpcConfig.user && pass === rpcConfig.pass) {
                    next();
                } else {
                    res.status(401).send();
                }
            } else next();
        }
    } catch (error) {
        response.error = 'Wrong request body';
        res.status(500).send(response);
    }
};
const methods = require(appRoot + '/test/SERVICES/BCH/bitcash_methods');
module.exports = (app) => {
    app.get('/', (req, res) => {
        res.status(404).send('TEST BITCASH RPC SERVICE')
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
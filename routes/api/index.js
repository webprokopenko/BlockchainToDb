const express = require('express');
const app = module.exports = express();

app.use('/v4.0', require('./v4.0'));
app.get('/', (req, res) => {
    res.status(404).send('API is available on /v4.0');
});
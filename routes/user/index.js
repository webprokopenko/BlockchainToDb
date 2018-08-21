const express = require('express');
const app = module.exports = express();
const userController = require(`../../controllers/userController`);

app.post('/register', async (req, res, next) => {
    try {
        let user = await userController.register(req.body);
        res.send(user);    
    } catch (error) {
        next(error)
    }
})
app.post('/auth', async (req, res, next) => {
    try {
        let user = await userController.sign_in(req.body, '15m');
        res.send(user);    
    } catch (error) {
        next(error)
    }
})
app.get('/currency', async (req, res, next) => {
    try {
        let curr = await userController.getCurrency(req);
        res.send(curr);
    } catch (error) {
        next(error);
    }
})
app.patch('/currency', async (req, res, next) => {
    try {
        let curr = await userController.updateCurrency(req);
        res.send(curr);
    } catch (error) {
        next(error);
    }
})


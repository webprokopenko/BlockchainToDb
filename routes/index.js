const config = require('../config/config');
const handlerErrors = require('../errors/HandlerErrors');
const ControllerFactory = require('../lib/ControllerFactory');
const controllerFactory = new ControllerFactory(config.currencies, appRoot, handlerErrors);
const controllers = [];
config.routes.api.forEach(api => {
    config.currencies.forEach(curr => {
        const controller = controllerFactory.getController(curr, api);
        if (controller.error) {
            console.log('Controller Code: ' + curr.code + ' API: ' + api + ' start error ' +
            controller.error.message);
        } else controllers.push(controller);
    });
});
function originalUriParser(uri) {
    try {
        return uri.split('/');
    } catch (error) {
        return false;
    }
}
function routeRun(req, res, next) {
    const route = originalUriParser(req.originalUrl);
    if (
        !route
        || route.length < 3
        || route[1] !== 'api'
    ) {
        res.status(404).send('Wrong request route');
    } else {
        const controller = controllers.filter(controller => (
            controller.code === route[3] && controller.api === route[4]
        ))[0];
        if (!controller) {
            res.status(404).send('Wrong request api');
        } else {
            req.params = route.slice(5);
            controller(req)
                .then(result => {
                    res.send(result);
                })
                .catch(error => {
                    next(error);
                });
            }
        }
}
module.exports = (app) => {
  app.get('/', routeRun);
  // app.post('/', selectRoute);
};
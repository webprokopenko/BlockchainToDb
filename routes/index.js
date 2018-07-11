const config = require('../config/config');
const handlerErrors = require('../errors/HandlerErrors');
const ControllerFactory = require('../lib/ControllerFactory');
const controllerFactory = new ControllerFactory(config, appRoot, handlerErrors);
const controllers = [];
config.routes.api.forEach(api => {
    config.currencies.forEach(curr => {
        const controller = controllerFactory.getController(curr, api);
        if (controller.error) {
            console.log('Controller Code:' + curr.code + ' API:' + api + ' start error ' +
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
            controller.code === route[3] && controller.apiVersion === route[2]
        ))[0];
        if (!controller || !controller[route[4]]) {
            res.status(404).send('Wrong request api');
        } else {
            const params = route.slice(5);
            controller[route[4]](params)
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
  app.use(routeRun);
  // app.post('/', selectRoute);
};
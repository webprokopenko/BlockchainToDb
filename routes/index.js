const config = require('../config/config');
const ControllerFactory = require('../lib/ControllerFactory');
const controllerFactory = new ControllerFactory(config.currencies, appRoot);
const controllers = [];
config.routes.api.forEach(api => {
    config.currencies.forEach(curr => {
        controllers.push(controllerFactory.getController(curr.code, api))
    });
});
function originalUriParser(uri) {
    try {
        return uri.split('/');
    } catch (error) {
        return false;
    }
}
function selectRoute(req, res) {
    const route = originalUriParser(req.originalUrl);
    if (!route || route.length < 2 || !config.routes.indexOf(route[1] >= 0)) {
        res.status(404).send('Wrong request route');
    } else if (route[1] !== 'api' || route.length < 3) {
        res.status(404).send('Wrong request route');
    } else {
        const selectedControllers = controllers.filter(controller => (
            controller.code === route[3] && controller.api === route[4]
        ));
        if (selectedControllers.length === 0) {
            res.status(404).send('Wrong request api');
        } else selectedControllers[0](req, res);
    }
}
module.exports = (app) => {
  app.get('/', selectRoute);
  // app.post('/', selectRoute);
};
function ControllerFactory(config, appRoot, handlerErrors) {
    this.config = config || {};
    this.appRoot = appRoot || '..';
    this.handlerErrors = handlerErrors || Error;
    this.baseController = require(appRoot + '/lib/baseConrtoller');
}
ControllerFactory.prototype.getController =
    function(curr, apiVersion = this.config.routes.defaultAPI) {
        try {
            const opts = {
                code: curr.code,
                network: curr.network,
                apiVersion: apiVersion,
                handlerErrors: this.handlerErrors,
                utils: {
                    common: require(this.appRoot + '/lib/utils/commonUtils')
                }
            };
            opts.utils[curr.code] = ;
            const controller = require(this.appRoot + '/controllers/'
                + apiVersion + 'Controller' + curr.code);
            return Object.assign(new this.baseCurrency(opts), new controller(opts));
        } catch (error) {
            return false;
        }
    };
module.exports = ControllerFactory;
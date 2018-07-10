function ControllerFactory(config, appRoot, handlerErrors) {
    this.config = config || {};
    this.appRoot = appRoot || '..';
    this.handlerErrors = handlerErrors || Error;
    this.baseController = require(appRoot + '/lib/baseController');
}
ControllerFactory.prototype.getController =
    function(curr, apiVersion = this.config.routes.defaultAPI) {
        try {
            const opts = {
                appRoot: this.appRoot,
                code: curr.code,
                name: curr.name,
                network: curr.network,
                apiVersion: apiVersion,
                handlerErrors: this.handlerErrors,
                rpc: curr.rpc,
                utils: require(this.appRoot + '/lib/utils/commonUtils'),
                rpcError: require(this.appRoot + '/errors/RpcError')
            };
            opts.kindCurrencies = this.config.bitKindCurrencies.indexOf(curr.code) >= 0 ?
            'BTC' : curr.code;
            opts['utils' + curr.code] = require(this.appRoot + '/lib/utils/utils' + opts.kindCurrencies);
            const controller = require(this.appRoot + '/controllers/'
                + apiVersion + '/Controller' + curr.code);
            return Object.assign(new this.baseController(opts), new controller(opts));
        } catch (error) {
            return {error: error};
        }
    };
module.exports = ControllerFactory;
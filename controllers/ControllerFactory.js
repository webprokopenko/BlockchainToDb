function ControllerFactory(config, appRoot, handlerErrors) {
    this.config = config || {};
    this.appRoot = appRoot || '..';
    this.handlerErrors = handlerErrors || Error;
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
            opts.kindCurrencies = this.config.ethKindCurrencies.indexOf(curr.code) >= 0 ?
                'ETH' : curr.code;
            opts['utils' + curr.code] = require(this.appRoot + '/lib/utils/utils' + opts.kindCurrencies);
            if(curr.contract) opts.contract = curr.contract;
            if(curr.decimals) opts.decimals = curr.decimals;
            const BaseController = require(appRoot + '/controllers/' + apiVersion + '/baseController');
            let controller = new BaseController(opts);
            const RController = require(this.appRoot + '/controllers/'
                + apiVersion + '/Controller' + curr.code);
            const runController = new RController(opts);
            Object.assign(controller, runController.__proto__);
            Object.assign(controller, runController);
            return controller;
        } catch (error) {
            return {error: error};
        }
    };
module.exports = ControllerFactory;
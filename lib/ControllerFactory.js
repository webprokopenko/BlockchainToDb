function ControllerFactory(config, appRoot) {
    this.config = config;
    this.currencies = [];
    this.baseCurrency = new require(appRoot + '/lib/baseCurrency');
}
ControllerFactory.prototype.getController =
    function(code, apiVersion = this.config.routes.defaultAPI) {
        if(0) return false;
        return Object.assign(this.baseCurrency, {
            code: code,
            apiVersion: apiVersion
        });
    };
module.exports = ControllerFactory;
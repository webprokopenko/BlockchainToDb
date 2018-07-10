function BaseController(opts) {
    Object.assign(this, opts);
    const RPCLIB = require(this.appRoot + '/lib/rpc' + this.kindCurrencies);
    this.rpcLib = new RPCLIB(opts);
    const DBLIB = require(this.appRoot + '/lib/db' + this.code);
    this.dbLib = new DBLIB(opts);
}
BaseController.prototype.getBalance = async function(req) {
    try {
        const address = this['utils' + this.code]['isAddress' + this.code](
            req.params[0],
            this.network
        );
        if (!address) {
            throw new Error('Wrong address');
        } else {
            return {
                balance: this.rpcLib['getBalance'] ?
                    await this.rpcLib.getBalance(req.params[0]) :
                    await this.dbLib.getBalance(req.params[0])
            };
        }
    } catch (error) {
        new this.handlerErrors(error);
    }
};
// BaseController.prototype.getTransactionsList = async function(req) {};
// BaseController.prototype.getTransaction = async function(req) {};
// BaseController.prototype.getBalance = async function(req) {};
// BaseController.prototype.sendRawTransaction = async function(req) {};

module.exports = BaseController;
function BaseController(opts) {
    Object.assign(this, opts);
    this.rpcLib = require(this.appRoot + '/lib/rpc' + this.kindCurrencies);
    this.dbLib = require(this.appRoot + '/lib/db' + this.code);
}
BaseController.prototype.getBalance = async function(req) {
    try {
        const address = this.utils[this.code]['isAddress' + this.code](req.params[0]);
        if (!address) {
            throw new Error('Wrong address');
        } else {
            return {
                balance: await this.rpcLib.getBalance(req.params[0])
            };
        }
    } catch (error) {
        new this.handlerErrors(error);
    }
};
BaseController.prototype.getTransactionsList = async function(req) {};
BaseController.prototype.getTransaction = async function(req) {};
BaseController.prototype.getBalance = async function(req) {};
BaseController.prototype.sendRawTransaction = async function(req) {};

module.exports = BaseController;
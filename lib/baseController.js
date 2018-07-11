function BaseController(opts) {
    Object.assign(this, opts);
    const RPCLIB = require(this.appRoot + '/lib/rpc' + this.kindCurrencies);
    this.rpcLib = new RPCLIB(opts);
    const DBLIB = require(this.appRoot + '/lib/db' + this.code);
    this.dbLib = new DBLIB(opts);
}
BaseController.prototype.getBalance = async function(params) {
    try {
        const address = this['utils' + this.code]['isAddress' + this.code](
            params[0],
            this.network
        );
        if (!address) {
            throw new Error('Wrong address');
        } else {
            return {
                balance: this.rpcLib['getBalance'] ?
                    await this.rpcLib.getBalance(address) :
                    await this.dbLib.getBalance(address)
            };
        }
    } catch (error) {
        new this.handlerErrors(error);
    }
};
BaseController.prototype.getTransactionsList = async function(params) {
    try {
        const address = this['utils' + this.code]['isAddress' + this.code](
            params[0],
            this.network
        );
        if (!address) {
            throw new Error('Wrong address');
        } else {
            const response = {};
            response.transactions = await this.dbLib.getTransactions(
                address,
                params[1] = 50,
                params[2] = 0);
            response.pending = await this.dbLib.getTempTransactions(address);
            response.pages = Math.ceil((await this.dbLib.getTransactionsCount(address))/50);
            return response;
        }
    } catch (error) {
        new this.handlerErrors(error);
    }
};
// BaseController.prototype.getTransaction = async function(req) {};
// BaseController.prototype.getBalance = async function(req) {};
// BaseController.prototype.sendRawTransaction = async function(req) {};

module.exports = BaseController;
function BaseController(opts) {
    Object.assign(this, opts);
    const RPCLIB = require(this.appRoot + '/lib/rpc' + this.kindCurrencies);
    this.rpcLib = new RPCLIB(opts);
    const dbLibPath = this.appRoot + '/lib/db' + this.kindCurrencies;
    if(this.utils.fileExists(dbLibPath)) {
        const DBLIB = require(dbLibPath);
        this.dbLib = new DBLIB(opts);
    }
}

/**
 * GET /api/v4.2/getBalance/:address
 *
 * @param params: array [
 *                          params[0] - ETH address
 *                          ]
 * @returns {Promise<{balance: number}>} - ETH address balance
 */
BaseController.prototype.getBalance = async function(params) {
    try {
        const address = this['utils' + this.kindCurrencies]['isAddress' + this.code](
            params[0],
            this.network
        );
        if (!address) {
            throw new Error('Wrong address');
        }
        return {
                balance: this.rpcLib['getBalance'] ?
                    await this.rpcLib.getBalance(address) :
                    await this.dbLib.getBalance(address)
            };
    } catch (error) {
        new this.handlerErrors(error.code === 32000 ?
            new this.rpcError(error.message, this.code, 32000) :
            error);
    }
};

/**
 * GET /api/v4.2/getTransactionsList/:address
 *
 * @param params: array [
 *                          params[0] - ETH address,
 *                          params[1] - requested list page (options)
 *                          ]
 * @returns {Promise<{
 *                      transactions: array[objects], (transaction object array)
 *                      pages: number, (options)
 *                      pending: array[objects], (transaction object array)
 *                      headers: array[object], ({
 *                                                  key: string, (header name)
 *                                                  value: any (header value)
 *                                                  })
 *                      }>}
 */
BaseController.prototype.getTransactionsList = async function(params) {
    try {
        const address = this['utils' + this.code]['isAddress' + this.code](
            params[0],
            this.network
        );
        if (!address) throw new Error('Wrong address');
        const page = parseInt(params[1], 10);
        const response = {};
        response.transactions = await this.dbLib.getTransactions(
            address,
            50,
            isNaN(page) ? 0 : page);
        response.pages = Math.ceil((await this.dbLib.getCountTransaction(address))/50);
        if (!params[1]) {
            response.headers = [
                {
                    key: 'TrPages',
                    value: response.pages
                }
            ];
            response.pending = await this.dbLib.getTempTransactions(address);
        }
        return response;
    } catch (error) {
        new this.handlerErrors(error.code === 32000 ?
            new this.rpcError(error.message, this.code, 32000) :
            error);
    }
};

/**
 * GET /api/v4.2/getTransaction/:hash
 *
 * @param params: array [
 *                          params[0] - ETH transaction hash,
 *                          ]
 * @returns {Promise<{object}>} - (ETH transaction object)
 */
BaseController.prototype.getTransaction = async function(params) {
    try {
        const hash = params[0];
        if (!this.utils.isString(hash)) {
            throw new Error('Wrong query parameter');
        } else {
            return await this.rpcLib.getTransaction(hash);
        }
    } catch (error) {
        new this.handlerErrors(error.code === 32000 ?
            new this.rpcError(error.message, this.code, 32000) :
            error);
    }
};

/**
 * GET /api/v4.2/sendRawTransaction/:hex
 *
 * @param params: array [
 *                          params[0] - ETH raw transaction in hex format,
 *                          ]
 * @returns {Promise<{hash: string}>} (ETH transaction hash)
 */
BaseController.prototype.sendRawTransaction = async function(params) {
    try {
        const hex = params[0];
        if (!this.utils.isString(hex)) {
            throw new Error('Wrong query parameter');
        } else {
            return await this.rpcLib.sendRawTransaction(hex);
        }
    } catch (error) {
        new this.handlerErrors(error.code === 32000 ?
            new this.rpcError(error.message, this.code, 32000) :
            error);
    }
};

module.exports = BaseController;
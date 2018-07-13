function ControllerNBTT(opts) {
    this.name = opts.name;
    this.contractAddress = opts.contract;
    this.decimals = opts.decimals;
    const ETH = require(opts.appRoot + '/controllers/' + opts.apiVersion
        + '/ControllerETH');
    const eth = new ETH();
    Object.assign(this.__proto__, eth.__proto__);
}

/**
 * GET /api/v4.2/getBalance/:address
 *
 * @param params: array [
 *                          params[0] - ETH address
 *                          ]
 * @returns {Promise<{balance: number}>} - ETH address balance
 */
ControllerNBTT.prototype.getBalance = async function(params) {
    try {
        const address = this['utilsETH']['isAddress' + this.code](
            params[0],
            this.network
        );
        if (!address) {
            throw new Error('Wrong address');
        }
        const data = '0x'
            + this.utils.sha3('balanceOf(address)').slice(0, 8)//"transfer(address, uint32)"
            + this.utilsETH.padLeft(this.utilsETH.
            toTwosComplement(address).toString(16), 64);
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
ControllerNBTT.prototype.getTransactionsList = async function(params) {
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


module.exports = ControllerNBTT;
function ControllerETH() {
}

/**
 * GET /api/v4.2/getTransaction/:hash
 *
 * @param params - Array[
 *                          hash - string, transaction hash
 *                          ]
 * @returns {Promise<{object}>}, ETH transaction object
 */
ControllerETH.prototype.getTransaction = async function (params) {
    try {
        const hash = params[0];
        if (!this.utils.isString(hash)) {
            throw new Error('Wrong query parameter');
        } else {
            const transaction = await this.rpcLib.getTransactionFromHash(hash);
            return Object.assign(transaction, await this.rpcLib.getGasFromTransactionHash(hash));
        }
    } catch (error) {
        new this.handlerErrors(error.code === 32000 ?
            new this.rpcError(error.message, this.code, 32000) :
            error);
    }
};

/**
 * GET /api/v4.2/getGasPrice
 *
 * @returns {Promise<{
 *                      gasPrice: number,
 *                      gasPriceHex: string (hex format)
 *                      }>}
 */
ControllerETH.prototype.getGasPrice = async function () {
    try {
        const gasPrice = await this.rpcLib.getGasPrice();
        return {
            'gasPrice': this.utils.convertHexToInt(gasPrice),
            'gasPriceHex': gasPrice
        };
    } catch (error) {
        new this.handlerErrors(error.code === 32000 ?
            new this.rpcError(error.message, this.code, 32000) :
            error);
    }
};

/**
 * GET /api/v4.2/getGasLimit
 *
 * @returns {Promise<{
 *                    gasLimit: number,
 *                    gasLimitHex: string (hex format)
 *                    }>}
 */
ControllerETH.prototype.getGasLimit = async function () {
    try {
        const block = await this.rpcLib.getBlockNumber();
        return {
            'gasLimit': this.utils.convertHexToInt(block.gasLimit),
            'gasLimitHex':block.gasLimit
        };
    } catch (error) {
        new this.handlerErrors(error.code === 32000 ?
            new this.rpcError(error.message, this.code, 32000) :
            error);
    }
};

/**
 * GET /api/v4.2/getPriceLimit
 *
 * @returns {Promise<{
 *                      gasLimit: number,
 *                      gasLimitHex: string,
 *                      gasPrice: number,
 *                      gasPriceHex: string
 *                      }>}
 */
ControllerETH.prototype.getPriceLimit = async function () {
    try {
        const gasLimit = await this.rpcLib.getGasLimit();
        const gasPrice = await this.rpcLib.getGasPrice();
        return {
            'gasLimit':gasLimit.gasLimit,
            'gasLimitHex':gasLimit.gasLimitHex,
            'gasPrice':gasPrice.gasPrice,
            'gasPriceHex':gasPrice.gasPriceHex
        };
    } catch (error) {
        new this.handlerErrors(error.code === 32000 ?
            new this.rpcError(error.message, this.code, 32000) :
            error);
    }
};

/**
 * GET /api/v4.2/getTransactionCount/:address
 *
 * @param address (ETH address)
 * @returns {Promise<{TransactionCount: number}>}
 */
ControllerETH.prototype.getTransactionCount = async function (address) {
    try {
        const addr = this.utilsETH.isAddressETH(address);
        if (!addr) {
            throw new Error('Wrong address');
        } else {
            const count = await this.rpcLib.getTransactionCount(addr);
            return {'TransactionCount': this.utils.convertHexToInt(count)};
        }
    } catch (error) {
        new this.handlerErrors(error.code === 32000 ?
            new this.rpcError(error.message, this.code, 32000) :
            error);
    }
};

module.exports = ControllerETH;
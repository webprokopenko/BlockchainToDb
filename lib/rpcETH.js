function EthereumRPC(opts) {
    this.utils = opts.utils;
    this.utilsETH = opts.utilsETH;
    this.rpc = opts.rpc;
    this.rpcError = opts.rpcError;
}

EthereumRPC.prototype.getContractDecimals = async function (contractAddress) {
    const data = '0x'
        + this.utils.sha3('decimals()').slice(0, 8);
    const response = await this.utils.sendRPC(
        'eth_call',
        this.rpc,
        [
            {
                value: '0x0',
                to: contractAddress,
                data: data
            },
            'latest'
        ]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`getContractDecimals Error from command geth  Message: ${res.error.message}`,
            'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError(`getContractDecimals response body empty contract ${contractAddress}`, 'eth', 200);
    try {
        return this.utils.toBigNumber(res.result);
    } catch (error) {
        throw new this.rpcError(`Wrong data by contract ${contractAddress}`, 'eth', 208);
    }
};
EthereumRPC.prototype.getTokens = async function (contractAddress, address) {
    const data = '0x'
        + this.utils.sha3('balanceOf(address)').slice(0, 8)//"transfer(address, uint32)"
        + this.utilsETH.padLeft(this.utilsETH.
        toTwosComplement(address).toString(16), 64);
    const response = await this.utils.sendRPC(
        'eth_call',
        this.rpc,
        [
            {
                value: '0x0',
                to: contractAddress,
                data: data
            },
            'latest'
        ]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`eth_call Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('getTokens response body empty contract ' + contractAddress +
            'balanceOf(' + address + ')', 'eth', 200);
    const tokens = this.utils.toBigNumber(res.result);
    return tokens;
};
EthereumRPC.prototype.getLatestBlock = async function () {
    return await this.getBlockNumber();
};
EthereumRPC.prototype.getGasPrice = async function () {
    const response = await this.utils.sendRPC(
        'eth_gasPrice',
        this.rpc
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`eth_gasPrice Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('eth_gasPrice response body empty', 'eth', 200);
    return res.result;
};
EthereumRPC.prototype.getBlockNumber = async function (param) {
    if (!param || (param !== 'pending'))
        param = 'latest';
    const response = await this.utils.sendRPC(
        'eth_getBlockByNumber',
        this.rpc,
        [param, true]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`eth_getBlockByNumber Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('eth_getBlockByNumber response body empty', 'eth', 200);
    if (!res.result.number)
        throw new this.rpcError('eth_getBlockByNumber gasUsed from transaction empty', 'eth', 204);
    return parseInt(this.utils.convertHexToInt(res.result.number));
};
EthereumRPC.prototype.getTransactionCountETH = async function (numBlock) {
    const blockData = await this.getBlockData(numBlock);
    return blockData.transactions.length;
};
EthereumRPC.prototype.getBlockData = async function (numBlock) {
    const response = await this.utils.sendRPC(
        'eth_getBlockByNumber',
        this.rpc,
        [this.utils.convertNumberToHex(numBlock), true]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`getBlockData Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('getBlockData response body empty', 'eth', 200);
    if (!res.result.transactions)
        throw new this.rpcError('getBlockData transactions empty', 'eth', 204);
    res.result.transactions.forEach(tx => {
        tx.input = this.utilsETH.isContractTransfer(tx)
            || this.utilsETH.isContractTransferFrom(tx) || {};
    });
    return res.result;
};
EthereumRPC.prototype.getGasFromTransactionHash = async function (hash) {
    const response = await this.utils.sendRPC(
        'eth_getTransactionReceipt',
        this.rpc,
        [hash]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`getGasFromTransactionHash Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('getGasFromTransactionHash response body empty', 'eth', 200);
    if (!res.result.gasUsed)
        throw new this.rpcError('getGasFromTransactionHash gasUsed from transaction empty', 'eth', 204);
    return {
        gasUsed: this.utils.convertHexToInt(res.result.gasUsed),
        status: this.utils.convertHexToInt(res.result.status)
    };
};
EthereumRPC.prototype.getTransactionCount = async function (address) {
    const response = await this.utils.sendRPC(
        'eth_getTransactionCount',
        this.rpc,
        [address]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`eth_getTransactionCount Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('eth_getTransactionCount response body empty', 'eth', 200);
    return res.result;
};
EthereumRPC.prototype.sendRawTransaction = async function (hex) {
    const response = await this.utils.sendRPC(
        'eth_sendRawTransaction',
        this.rpc,
        [hex]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`eth_sendRawTransaction Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('eth_sendRawTransaction response body empty', 'eth', 200);
    return res.result;
};
EthereumRPC.prototype.getBalance = async function(address) {
    const response = await this.utils.sendRPC(
        'eth_getBalance',
        this.rpc,
        [address, 'latest']
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`eth_getBalance Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('eth_getBalance response body empty', 'eth', 200);
    return parseInt((this.utils.toBigNumber(res.result).div(1e18).toString()));
};
EthereumRPC.prototype.getTransactionFromHash = async function (hash) {
    const response = await this.utils.sendRPC(
        'eth_getTransactionByHash',
        this.rpc,
        [hash]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`eth_getTransactionByHash Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('eth_getTransactionByHash response body empty', 'eth', 200);
    return res.result;
};

module.exports = EthereumRPC;
function EthreumRPC(opts) {
    Object.assign(this, opts);
}
EthreumRPC.prototype.getBalance = async function(address) {
    const response = await this.utils.sendRPC(
        'eth_getBalance',
        this.rpc,
        [address, 'latest']
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`getBalance Error from command geth  Message: ${res.error.message}`, 'eth', res.error.code);
    if (!res.result)
        throw new this.rpcError('getBalance response body empty', 'eth', 200);
    return this.utils.toBigNumber(res.result).div(1e18).toString();
};
module.exports = EthreumRPC;
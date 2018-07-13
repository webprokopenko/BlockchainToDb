function BitcoinRPC(opts) {
    this.utils = opts.utils;
    this.utilsBTC = opts.utilsBTC;
    this.rpc = opts.rpc;
    this.rpcError = opts.rpcError;
}

BitcoinRPC.prototype.sendRawTransaction = async function (hex) {
    const response = await this.utils.sendRPC(
        'sendrawtransaction',
        this.rpc,
        [hex]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`sendrawtransaction Error from command geth  Message: ${res.error.message}`, 'btc', res.error.code);
    const hash = res.result;
    if (!hash)
        throw new this.rpcError('sendrawtransaction response body empty', 'btc', 200);
};
BitcoinRPC.prototype.getOriginalTransaction = async function (txid) {
    const response = await this.utils.sendRPC(
        'getrawtransaction',
        this.rpc,
        [txid, 1]
    );
    const res = this.utils.isJson(response) ? JSON.parse(response) : {};
    if (res.error)
        throw new this.rpcError(`getrawtransaction Error from command geth  Message: ${res.error.message}`, 'btc', res.error.code);
    const tx = res.result;
    if (!tx)
        throw new this.rpcError('getrawtransaction response body empty', 'btc', 200);
    return res.result;
};
BitcoinRPC.prototype.getTransaction = async function (txid) {
    const tx = await this.getOriginalTransaction(txid);
    const txVin = [];
    if (tx.vin) while(tx.vin.length > 0) {
        const vin = tx.vin[0];
        const tvin = await this.getOriginalTransaction(vin.txid);
        vin.addresses = tvin.vout[vin.vout].scriptPubKey.addresses;
        vin.value = tvin.vout[vin.vout].value;
        txVin.push(vin);
        tx.vin.shift();
    }
    tx.vin = txVin;
    return tx;
};

module.exports = BitcoinRPC;
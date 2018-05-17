module.exports = class RpcError extends require('./AppError') {
  constructor(message, client, codeErr) {
    super(message ? `Rpc Error ${message}`: 'Rpc Error', 400);
    this.client = client;
    this.codeErr = codeErr;
  }
};
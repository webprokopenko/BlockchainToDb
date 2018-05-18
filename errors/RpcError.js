module.exports = class RpcError extends require('./AppError') {
  constructor(message, client, codeErr) {
    super(message ? `${message}`: 'Rpc Error', 500);
    this.client = client;
    this.codeErr = codeErr;
  }
};
module.exports = class ScannerError extends require('./AppError') {
    constructor(message, blockNum, blockChain) {
      super(message ? `${message}`: 'Scanner Error', 500);
      this.blockNum = blockNum;
      this.blockChain = blockChain;
    }
  };
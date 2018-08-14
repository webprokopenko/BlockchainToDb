class Contracts{
    constructor(){
        this.contracts = new Map();
        this.utils = require('./utilsETH');
        this.geth = require('./getETHRpc');
        this.resond = {
            address : '',
            tokens : {

            }
        }
        this.contracts.set('ZRX', '0xD0fCcCe95c44a8c4Bd3C111718Bdc3D3Bcd56FB9');
        this.contracts.set('OMG', '0x2DaB476e673f5C8713153B21eD7003315Ff19d62');
        this.contracts.set('ZIL', '0xd8c67febd31ff9f12d0527c6a8c9850e420317dc');
        this.contracts.set('REP', '0xf82672940290bec96884a2df0a1c26a7f7e9b378');
        this.contracts.set('GNT', '0x925ce15dd88ebb75472a5649ed338203a16b34dc');
        this.contracts.set('SNT', '0xeb204b45e6e9b0d118c99edd5cfd6a91fab5b797');
        this.contracts.set('BNT', '0x3b4e01d64ffa7d37265b0ad46492023e29727332');
        this.contracts.set('MCO', '0xd72d7e3403678c8e074905dd6e04c38c8d5e3dcf');
        this.contracts.set('KNC', '0x25455feae9eaeeb68300774391e51fe4bdac9b72');
        this.contracts.set('POWR', '0x99d305adf574d22d849a5198188a6289e98462a2');
        this.contracts.set('TUSD', '0x2272e362c956bd91e5434e4ead1eb09de9bec6e3');
    }
    validateRespTokenList(obj){
        if(!this.utils.isObject(obj))
            return false
        if (!obj || !obj.address)
            return false
        if (!obj.tokens || !this.utils.isArray(obj.tokens))
            return false

        return true;
    }
    async getTokenList(obj){
        let listTokens = {};
        await Promise.all(obj.tokens.map(async (element) => {
            if(this.contracts.has(element)){
                const decimals = await this.geth.getContractDecimals(this.contracts.get(element));
                const tokens = await this.geth.getTokens(this.contracts.get(element), obj.address);
                listTokens[element] = tokens.dividedBy(10 ** decimals.toNumber());
            }else{
                listTokens[element] = null;
            }
        }))   
        return listTokens;
    }
}

module.exports = Contracts;
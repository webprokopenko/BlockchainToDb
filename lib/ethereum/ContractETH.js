class Contracts{
    constructor(){
        this.utils = require('./utilsETH');
        this.geth = require('./getETHRpc');
        this.contracts = require('./contractsList');
        this.resond = {
            address : '',
            tokens : {

            }
        }
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
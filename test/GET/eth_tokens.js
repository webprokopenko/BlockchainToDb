const path = require('path');
global.appRoot = path.resolve(__dirname);
global.appRoot = global.appRoot.replace('/test/GET','');
//const coder = require(appRoot + '/lib/ethereum/solidity/coder');
//const sha3 = require(appRoot + '/lib/ethereum/utils/sha3');
const utils = require(appRoot + '/lib/ethereum/utilsETH');
const big = require('bignumber.js');

describe('Test Solidity',()=> {
    it('coder', (done) => {
        const ut = utils.padLeft(utils
            .toTwosComplement('0x185d8e679dea05151144008e06643ea447f96397').toString(16), 64);
        console.dir(ut);
        const data = '0x'
            + utils.sha3('balanceOf(address)').slice(0,8)
            + ut;//coder.encodeParams(['address'], ['0xc6128ca6b8e7af1abb8034da1b493bf85af0230f']);
        console.log(data);
        console.log(new big('0x000000000000000000000000000000000000000000000000000000173d008618', 16))
        done();
    })
})
let express = require('express'),
    router = express.Router();

router.get('/ETH/getTransactionsList/:address',(req,res)=>{
    //let id = req.params.address;
    console.log('getTransactionList');
    res.json("id");
});

module.exports = router;
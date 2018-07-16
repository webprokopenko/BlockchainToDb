const cote = require('cote');

const requester = new cote.Requester({ name: 'currency conversion requester' });
const request = { type: 'update rate', usd_eur: 0.91};


requester.send(request, (res) => {console.log(res);})


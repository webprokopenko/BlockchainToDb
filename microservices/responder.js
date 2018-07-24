const cote = require('cote');

const responder = new cote.Responder({name:'Responder'});

responder.on('send', (req, cb) => {
    console.log(t req);
})
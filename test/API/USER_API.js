process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app.js');
const should = chai.should();

const TEST_DATA = require('../test-data.json');
chai.use(chaiHttp);
function makeEmail() {
    var part1 = "";
    let part2 = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < 15; i++)
        part1 += possible.charAt(Math.floor(Math.random() * possible.length));
    for (let i = 0; i < 5; i++)
        part2 += possible.charAt(Math.floor(Math.random() * possible.length));

    return part1 + '@' + part2 + '.com';
}
function getToken(email) {
    return new Promise((resolve, reject) => {
        chai.request(server)
            .post(`/user/auth/`)
            .set('content-type', 'application/x-www-form-urlencoded')
            .send(`email=${email}`)
            .send('password=password')
            .end((err, res) => {
                if (err) reject(err);
                resolve(res.body.token);
            }
            )
    })
}
let email = makeEmail();
describe('User API', () => {
    describe('/Register new User', () => {
        it('it should Register new User', (done) => {
            chai.request(server)
                .post(`/user/register/`)
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(`email=${email}`)
                .send('password=password')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('email', email);
                    done();
                });
        });
    });
    describe('/Auth User', () => {
        it('it should Auth User', (done) => {
            chai.request(server)
                .post(`/user/auth/`)
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(`email=${email}`)
                .send('password=password')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('token');
                    done();
                });
        });
    });
    describe('/Get User currency', () => {
        it('it should Auth User', (done) => {
            getToken(email).then(token => {
                chai.request(server)
                .get('/user/currency/')
                .set('Authorization', `JWT ${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('currency')
                    done();
                });
            })
        });
    });
    describe('/Set User currency', () => {
        it('it should Auth User', (done) => {
            getToken(email).then(token => {
                chai.request(server)
                .patch(`/user/currency/`)
                .set('Authorization', `JWT ${token}`)
                .set('content-type', 'application/x-www-form-urlencoded')
                .send(`currency=eur`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    done();
                });
            })
        });
    });
});
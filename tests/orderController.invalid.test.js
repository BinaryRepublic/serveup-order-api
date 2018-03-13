'use strict';

const expect = require('chai').expect;
const request = require('supertest');

const Helper = require('./helper/helper');

const invalid = require('./mockData/orderController/invalid');

describe('loading express', function () {
    let server;
    beforeEach(function () {
        server = require('../index');
    });
    afterEach(function () {
        server.close();
    });
    describe('ORDER-INVALID', () => {
        it('GET /order missingId', (done) => {
            request(server)
                .get('/order')
                .set('Accept', 'application/json')
                .expect(400)
                .end(function (err, response) {
                    if (err) return done(err);

                    expect(response.body.error.type).to.equal('PARAM_MISSING');
                    done();
                });
        });
        it('GET /order invalidId', (done) => {
            request(server)
                .get('/order' + Helper.toQueryStr(invalid.getOrderById.invalidId.query))
                .set('Accept', 'application/json')
                .expect(500)
                .end(function (err, response) {
                    if (err) return done(err);

                    done();
                });
        });
        it('GET /order/restaurant invalidId', (done) => {
            request(server)
                .get('/order/restaurant' + Helper.toQueryStr(invalid.getOrderByRestaurantId.invalidId.query))
                .set('Accept', 'application/json')
                .expect(500, done);
        });
        it('PUT /order invalidId', (done) => {
            request(server)
                .put('/order/status')
                .send(invalid.updateOrderStatus.invalidId.body)
                .set('Accept', 'application/json')
                .expect(500, done);
        });
        it('PUT /order invalidStatus', (done) => {
            request(server)
                .put('/order/status')
                .send(invalid.updateOrderStatus.invalidStatus.body)
                .set('Accept', 'application/json')
                .expect(400)
                .end(function (err, response) {
                    if (err) return done(err);

                    expect(response.body.error.type).to.equal('PARAM_VALUE');
                    done();
                });
        });
        it('POST /order emptyOrder', (done) => {
            request(server)
                .post('/order')
                .send(invalid.postOrder.emptyOrder.body)
                .set('Accept', 'application/json')
                .expect(400)
                .end(function (err, response) {
                    if (err) return done(err);

                    expect(response.body.error.type).to.equal('PARAM_VALUE');
                    done();
                });
        });
    });
});

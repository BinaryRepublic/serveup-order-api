'use strict';

const expect = require('chai').expect;
const request = require('supertest');

const Helper = require('./helper/helper');

// require controllers
const OrderController = require('../src/controller/OrderController');
const valid = require('./mockData/orderController/valid');

describe('loading express', function () {
    let server;
    beforeEach(function () {
        server = require('../index');
    });
    afterEach(function () {
        server.close();
    });
    describe('ORDER-VALID', () => {
        const controller = new OrderController();
        it('check controller methods', () => {
            expect(controller.getOrderById).to.be.a('Function');
            expect(controller.getOrderByRestaurantId).to.be.a('Function');
            expect(controller.updateOrderStatus).to.be.a('Function');
            expect(controller.postOrder).to.be.a('Function');
            expect(controller.getKeywords).to.be.a('Function');
        });
        it('GET /order', (done) => {
            request(server)
                .get('/order' + Helper.toQueryStr(valid.getOrderById.query))
                .set({'Accept': 'application/json', 'Access-Token': 'unittest'})
                .expect(200)
                .end(function (err, response) {
                    if (err) return done(err);

                    let order = response.body;
                    expect(order.id).to.be.a('string');
                    expect(order.items).to.be.a('array');
                    expect(order.items[0].name).to.be.a('string');
                    expect(order.items[0].size).to.be.a('number');
                    expect(order.items[0].nb).to.be.a('number');
                    expect(order.voiceDeviceId).to.be.a('string');
                    expect(order.restaurantId).to.be.a('string');
                    expect(order.status).to.be.a('number');
                    done();
                });
        });
        it('GET /order/restaurant', (done) => {
            request(server)
                .get('/order/restaurant' + Helper.toQueryStr(valid.getOrderByRestaurantId.query))
                .set({'Accept': 'application/json', 'Access-Token': 'unittest'})
                .expect(200)
                .end(function (err, response) {
                    if (err) return done(err);

                    let orders = response.body;
                    expect(orders).to.be.a('array');

                    let order = orders[0];
                    expect(order.id).to.be.a('string');
                    expect(order.timestamp).to.be.a('string');
                    expect(order.voiceDeviceId).to.be.a('string');
                    expect(order.restaurantId).to.be.a('string');
                    expect(order.status).to.be.a('number');

                    expect(order.items).to.be.a('array');
                    let orderItem = order.items[0];
                    expect(orderItem.id).to.be.a('string');
                    expect(orderItem.name).to.be.a('string');
                    expect(orderItem.size).to.be.a('number');
                    expect(orderItem.nb).to.be.a('number');
                    done();
                });
        });
        it('PUT /order/status', (done) => {
            request(server)
                .put('/order/status')
                .send(valid.updateOrderStatus.body)
                .set({'Accept': 'application/json', 'Access-Token': 'unittest'})
                .expect(200)
                .end(function (err, response) {
                    if (err) return done(err);

                    let order = response.body;
                    expect(order.id).to.be.a('string');
                    expect(order.timestamp).to.be.a('string');
                    expect(order.voiceDeviceId).to.be.a('string');
                    expect(order.restaurantId).to.be.a('string');
                    expect(order.status).to.be.a('number');

                    expect(order.items).to.be.a('array');
                    let orderItem = order.items[0];
                    expect(orderItem.id).to.be.a('string');
                    expect(orderItem.name).to.be.a('string');
                    expect(orderItem.size).to.be.a('number');
                    expect(orderItem.nb).to.be.a('number');
                    done();
                });
        });
        it('POST /order', (done) => {
            request(server)
                .post('/order')
                .send(valid.postOrder.body)
                .set({'Accept': 'application/json', 'Access-Token': 'unittest'})
                .expect(200)
                .end(function (err, response) {
                    if (err) return done(err);

                    let order = response.body;
                    let orderMenu = order.menu;
                    expect(orderMenu.id).to.be.a('string');
                    expect(orderMenu.timestamp).to.be.a('string');
                    expect(orderMenu.voiceDeviceId).to.be.a('string');
                    expect(orderMenu.restaurantId).to.be.a('string');
                    expect(orderMenu.status).to.be.a('number');
                    expect(orderMenu.status).to.be.equal(0);

                    expect(orderMenu.items).to.be.a('array');
                    let orderMenuItem = orderMenu.items[0];
                    expect(orderMenuItem.id).to.be.a('string');
                    expect(orderMenuItem.name).to.be.a('string');
                    expect(orderMenuItem.size).to.be.a('number');
                    expect(orderMenuItem.nb).to.be.a('number');

                    let orderService = order.service;
                    expect(orderMenu.id).to.be.a('string');
                    expect(orderMenu.timestamp).to.be.a('string');
                    expect(orderMenu.voiceDeviceId).to.be.a('string');
                    expect(orderMenu.restaurantId).to.be.a('string');
                    expect(orderMenu.status).to.be.a('number');
                    expect(orderMenu.status).to.be.equal(0);

                    expect(orderService.items).to.be.a('array');
                    let orderServiceItem = orderService.items[0];
                    expect(orderServiceItem.name).to.be.a('string');
                    done();
                });
        });
        it('GET /orderkeywords', (done) => {
            request(server)
                .get('/orderkeywords' + Helper.toQueryStr(valid.getOrderKeywords.query))
                .set({'Accept': 'application/json', 'Access-Token': 'unittest'})
                .expect(200)
                .end(function (err, response) {
                    if (err) return done(err);

                    let keywords = response.body;
                    expect(keywords).to.be.a('array');
                    let keyword = keywords[0];
                    expect(keyword).to.be.a('string');
                    done();
                });
        });
    });
});

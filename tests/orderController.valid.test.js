'use strict';

const expect = require('chai').expect;

const Router = require('./helper/routingSimulator');

// prepare realm
const RealmOrderController = require('../ro-realm/controller/RealmOrderController');
const realmOrderController = new RealmOrderController();
const realm = realmOrderController.realm;

// require controllers
const OrderController = require('../src/controller/OrderController');
const valid = require('./mockData/orderController/valid');

describe('OrderControllerValid', () => {
    const controller = new OrderController();
    it('Create object and check methods', () => {
        expect(controller.getOrderById).to.be.a('Function');
        expect(controller.getOrderByRestaurantId).to.be.a('Function');
        expect(controller.updateOrderStatus).to.be.a('Function');
        expect(controller.postOrder).to.be.a('Function');
        expect(controller.getKeywords).to.be.a('Function');
    });
    it('getOrderById', (done) => {
        realm.then(() => {
            Router.simulate(controller.getOrderById, valid.getOrderById).then(response => {
                expect(response.status).to.equal(200);
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
            }).catch(err => {
                done(err);
            });
        });
    });
    it('getOrderByRestaurantId', (done) => {
        realm.then(() => {
            Router.simulate(controller.getOrderByRestaurantId, valid.getOrderByRestaurantId).then(response => {
                expect(response.status).to.equal(200);
                let orders = response.body;
                expect(orders).to.be.a('array');

                let order = orders[0];
                expect(order.id).to.be.a('string');
                expect(order.timestamp).to.be.a('date');
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
            }).catch(err => {
                done(err);
            });
        });
    });
    it('updateOrderStatus', (done) => {
        realm.then(() => {
            Router.simulate(controller.updateOrderStatus, valid.updateOrderStatus).then(response => {
                expect(response.status).to.equal(200);
                let order = response.body;
                expect(order.id).to.be.a('string');
                expect(order.timestamp).to.be.a('date');
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
            }).catch(err => {
                done(err);
            });
        });
    });
    it('postOrder', (done) => {
        realm.then(() => {
            // VOICEDEVICE-ID STILL MISSING
            Router.simulate(controller.postOrder, valid.postOrder).then(response => {
                expect(response.status).to.equal(200);
                let order = response.body;
                expect(order.id).to.be.a('string');
                expect(order.timestamp).to.be.a('date');
                expect(order.voiceDeviceId).to.be.a('string');
                expect(order.restaurantId).to.be.a('string');
                expect(order.status).to.be.a('number');
                expect(order.status).to.be.equal(0);

                expect(order.items).to.be.a('array');
                let orderItem = order.items[0];
                expect(orderItem.id).to.be.a('string');
                expect(orderItem.name).to.be.a('string');
                expect(orderItem.size).to.be.a('number');
                expect(orderItem.nb).to.be.a('number');
                done();
            }).catch(err => {
                done(err);
            });
        });
    });
    it('getKeywords', (done) => {
        realm.then(() => {
            // VOICEDEVICE-ID STILL MISSING
            Router.simulate(controller.getKeywords, valid.getKeywords).then(response => {
                expect(response.status).to.equal(200);
                let keywords = response.body;
                expect(keywords).to.be.a('array');
                let keyword = keywords[0];
                expect(keyword).to.be.a('string');
                done();
            }).catch(err => {
                done(err);
            });
        });
    });
});

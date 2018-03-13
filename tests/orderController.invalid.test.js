'use strict';

const expect = require('chai').expect;

const Router = require('./helper/routingSimulator');

// prepare realm
const RealmOrderController = require('../ro-realm/controller/RealmOrderController');
const realmOrderController = new RealmOrderController();
const realm = realmOrderController.realm;

// require controllers
const OrderController = require('../src/controller/OrderController');
const invalid = require('./mockData/orderController/invalid');

describe('OrderControllerInvalid', () => {
    const controller = new OrderController();
    describe('getOrderById', () => {
        it('missingId', (done) => {
            realm.then(() => {
                Router.simulate(controller.getOrderById, invalid.getOrderById.missingId).then(response => {
                    expect(response.status).to.equal(400);
                    expect(response.body.error.type).to.equal('PARAM_MISSING');
                    done();
                }).catch(err => {
                    done(err);
                });
            });
        });
        it('invalidId', (done) => {
            realm.then(() => {
                Router.simulate(controller.getOrderById, invalid.getOrderById.invalidId).then(response => {
                    expect(response.status).to.equal(500);
                    done();
                }).catch(err => {
                    done(err);
                });
            });
        });
    });
    describe('getOrderByRestaurantId', () => {
        it('invalidId', (done) => {
            realm.then(() => {
                Router.simulate(controller.getOrderByRestaurantId, invalid.getOrderByRestaurantId.invalidId).then(response => {
                    expect(response.status).to.equal(500);
                    done();
                }).catch(err => {
                    done(err);
                });
            });
        });
    });
    describe('updateOrderStatus', () => {
        it('invalidId', (done) => {
            realm.then(() => {
                Router.simulate(controller.updateOrderStatus, invalid.updateOrderStatus.invalidId).then(response => {
                    expect(response.status).to.equal(500);
                    done();
                }).catch(err => {
                    done(err);
                });
            });
        });
        it('invalidStatus', (done) => {
            realm.then(() => {
                Router.simulate(controller.updateOrderStatus, invalid.updateOrderStatus.invalidStatus).then(response => {
                    expect(response.status).to.equal(400);
                    expect(response.body.error.type).to.equal('PARAM_VALUE');
                    done();
                }).catch(err => {
                    done(err);
                });
            });
        });
    });
    describe('postOrder', () => {
        it('emptyOrder', (done) => {
            realm.then(() => {
                Router.simulate(controller.postOrder, invalid.postOrder.emptyOrder).then(response => {
                    expect(response.status).to.equal(400);
                    done();
                }).catch(err => {
                    done(err);
                });
            });
        });
    });
});

'use strict';

const APIController = require('./APIController');
const RealmMenuController = require('../../ro-realm/controller/RealmMenuController');
const RealmOrderController = require('../../ro-realm/controller/RealmOrderController');
const RealmVoiceDeviceController = require('../../ro-realm/controller/RealmVoiceDeviceController');

class OrderController extends APIController {
    constructor () {
        super();
        this.realmMenu = new RealmMenuController();
        this.realmOrder = new RealmOrderController();
        this.realmVoiceDevice = new RealmVoiceDeviceController();
        this.getOrderById = this.getOrderById.bind(this);
        this.getOrderByRestaurantId = this.getOrderByRestaurantId.bind(this);
        this.updateOrderStatus = this.updateOrderStatus.bind(this);
        this.postOrder = this.postOrder.bind(this);
        this.getKeywords = this.getKeywords.bind(this);
    };
    getOrderById (req, res) {
        const that = this;
        let reqValid = this.requestValidator.validRequestData(req.query, ['id']);
        this.handleRequest(reqValid, () => {
            var order = that.realmOrder.getOrderById(req.query.id);
            order = that.realmOrder.formatRealmObj(order);
            return order;
        }, res);
    }
    getOrderByRestaurantId (req, res) {
        const that = this;
        console.log('/order/restaurant');
        console.log(req.query);
        let reqValid = this.requestValidator.validRequestData(req.query, ['restaurant-id']);
        this.handleRequest(reqValid, () => {
            let restaurantId = req.query['restaurant-id'];
            let status = req.query.status;
            let orders = that.realmOrder.getOrdersByRestaurantId(restaurantId);
            orders = that.realmOrder.formatRealmObj(orders);
            if (status) {
                orders = orders.filter(item => {
                    return (parseInt(item.status) === parseInt(status));
                });
            }
            return orders;
        }, res);
    }
    updateOrderStatus (req, res) {
        const that = this;
        let reqValid = this.requestValidator.validRequestData(req.body, ['id', 'status']);
        this.handleRequest(reqValid, () => {
            let orderId = req.body.id;
            let status = req.body.status;
            let order = that.realmOrder.getOrderById(orderId);
            order = that.realmOrder.formatRealmObj(order);
            order.status = status;
            return that.realmOrder.formatRealmObj(that.realmOrder.updateOrder(orderId, order));
        }, res);
    }
    postOrder (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.body, ['order']);
        this.handleRequest(reqValid, () => {
            // TEST >>>>> no voice device
            let menu;
            let voiceDevice = this.realmVoiceDevice.formatRealmObj(this.realmVoiceDevice.objectWithClassName('VoiceDevice'));
            if (!voiceDevice.length) {
                // get restaurant
                let restaurants = this.realmMenu.objectWithClassName('Restaurant');
                if (restaurants.length) {
                    let restaurant = this.realmMenu.formatRealmObj(restaurants)[0];
                    // create voiceDevice
                    voiceDevice = this.realmVoiceDevice.createVoiceDevice(restaurant.id, {
                        number: 1
                    });
                    menu = this.realmMenu.getMenuByRestaurantId(restaurant.id);
                    if (menu) {
                        menu = menu[0];
                    } else {
                        return {error: 'no menu found'};
                    }
                } else {
                    return {error: 'no restaurant found'};
                }
            } else {
                voiceDevice = voiceDevice[0];
                // FINAL
                menu = this.realmMenu.getMenuByRestaurantId(voiceDevice.restaurantId);
                menu = this.realmMenu.formatRealmObj(menu, true);
                if (menu) {
                    menu = menu[0];
                } else {
                    return {error: 'no menu found'};
                }
            }

            let input = req.body.order;
            let nlpAlgorithm = require('../library/nlpAlgorithm/main');
            let order = nlpAlgorithm(menu, input, req.originalUrl);

            if (!req.query.getonly) {
                // insert order
                if (Array.isArray(order) && order.length) {
                    this.realmOrder.createOrder(voiceDevice.id, order);
                }
            }
            return order;
        }, res);
    }

    getKeywords (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.body, []);
        this.handleRequest(reqValid, () => {
            // test: select first menu in DB
            let menu = this.realmMenu.objectWithClassName('Menu');
            menu = this.realmMenu.formatRealmObj(menu)[0];

            let orderKeywords = [];
            let checkOderKeywordsDuplicate = (name) => {
                orderKeywords.forEach(item => {
                    if (item === name) {
                        return false;
                    }
                });
                return true;
            };
            let getKeywordsByMenu = (obj) => {
                obj.forEach(item => {
                    if (checkOderKeywordsDuplicate(item.name)) {
                        orderKeywords.push(item.name);
                    }
                    item.synonym.forEach(synonym => {
                        if (checkOderKeywordsDuplicate(synonym)) {
                            orderKeywords.push(synonym);
                        }
                    });
                    if (item.child.length) {
                        getKeywordsByMenu(item.child);
                    }
                });
            };
            getKeywordsByMenu(menu.drinks);
            return orderKeywords;
        }, res);
    }
}
module.exports = OrderController;

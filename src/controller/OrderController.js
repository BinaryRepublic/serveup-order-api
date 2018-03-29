'use strict';

const APIController = require('./APIController');
const RealmMenuController = require('../../ro-realm/controller/RealmMenuController');
const RealmOrderController = require('../../ro-realm/controller/RealmOrderController');
const RealmVoiceDeviceController = require('../../ro-realm/controller/RealmVoiceDeviceController');

const Authorization = require('../middleware/controllerAuthorization');

const MenuAlgorithm = require('../library/menuAlgorithm/main');
const ServiceAlgorithm = require('../library/serviceAlgorithm/main');

class OrderController extends APIController {
    constructor () {
        super();
        this.realmMenu = new RealmMenuController();
        this.realmOrder = new RealmOrderController();
        this.realmVoiceDevice = new RealmVoiceDeviceController();

        this.authorization = new Authorization();

        this.getOrderById = this.getOrderById.bind(this);
        this.getOrderByRestaurantId = this.getOrderByRestaurantId.bind(this);
        this.updateOrderStatus = this.updateOrderStatus.bind(this);
        this.postOrder = this.postOrder.bind(this);
        this.getKeywords = this.getKeywords.bind(this);
    };
    getOrderById (req, res) {
        const that = this;
        let reqValid = this.requestValidator.validRequestData(req.query, [{
            name: 'id',
            type: 'string'
        }]);
        this.handleRequest(reqValid, () => {
            let authorization = that.authorization.request(req.accountId, 'Order', req.query.id);
            if (authorization && !authorization.error) {
                let order = that.realmOrder.getOrderById(req.query.id);
                order = that.realmOrder.formatRealmObj(order);
                return order;
            } else {
                return authorization;
            }
        }, res);
    }
    getOrderByRestaurantId (req, res) {
        const that = this;
        let reqValid = this.requestValidator.validRequestData(req.query, [{
            name: 'restaurant-id',
            type: 'string'
        }]);
        this.handleRequest(reqValid, () => {
            let authorization = that.authorization.request(req.accountId, 'Restaurant', req.query['restaurant-id']);
            if (authorization && !authorization.error) {
                let restaurantId = req.query['restaurant-id'];
                let status = req.query.status;

                // load menuOrders
                let orders = that.realmOrder.getOrdersByRestaurantId(restaurantId);
                orders = that.realmOrder.formatRealmObj(orders);

                // sort orders
                if (orders && Array.isArray(orders)) {
                    orders.sort((a, b) => {
                        if (a.timestamp > b.timestamp) {
                            return 1;
                        } else {
                            return -1;
                        }
                    });
                }

                // filter status
                if (orders !== undefined && status) {
                    orders = orders.filter(item => {
                        return (parseInt(item.status) === parseInt(status));
                    });
                }

                return orders;
            } else {
                return authorization;
            }
        }, res);
    }
    updateOrderStatus (req, res) {
        const that = this;
        let reqValid = this.requestValidator.validRequestData(req.body, [{
            name: 'id',
            type: 'string'
        }, {
            name: 'status',
            type: 'number',
            values: [0, 1, 2],
            optional: true
        }]);
        this.handleRequest(reqValid, () => {
            let authorization = that.authorization.request(req.accountId, 'Order', req.body.id);
            if (authorization && !authorization.error) {
                let orderId = req.body.id;
                let status = req.body.status;
                let order = that.realmOrder.getOrderById(orderId);
                if (order !== undefined) {
                    order = that.realmOrder.formatRealmObj(order);
                    order.status = status;
                    return that.realmOrder.formatRealmObj(that.realmOrder.updateOrder(orderId, order));
                }
            } else {
                return authorization;
            }
        }, res);
    }
    postOrder (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.body, [{
            name: 'order',
            type: 'string',
            nvalues: ['']
        }, {
            name: 'voiceDeviceId',
            type: 'string',
            nvalues: ['']
        }]);
        const that = this;
        this.handleRequest(reqValid, () => {
            let authorization = that.authorization.request(req.accountId, 'VoiceDevice', req.body.voiceDeviceId);
            if (authorization && !authorization.error) {
                let menu;
                let voiceDevice = this.realmVoiceDevice.formatRealmObj(this.realmVoiceDevice.getVoiceDeviceById(req.body.voiceDeviceId));
                if (voiceDevice) {
                    menu = this.realmMenu.getMenuByRestaurantId(voiceDevice.restaurantId);
                    if (menu) {
                        menu = this.realmMenu.formatRealmObj(menu, true)[0];
                    }
                } else {
                    // wrong voiceDeviceId
                    return;
                }

                let input = req.body.order;
                let order = {
                    drinks: [],
                    services: []
                };

                // search for menu orders
                let menuOrderItems = [];
                if (menu) {
                    let menuAlgorithm = new MenuAlgorithm(menu);
                    menuOrderItems = menuAlgorithm.getOrder(input);
                    order.drinks = menuOrderItems;
                }
                // search for service orders
                let serviceAlgorithm = new ServiceAlgorithm();
                let serviceOrderItems = serviceAlgorithm.getOrder(input);
                order.services = serviceOrderItems;

                if (!req.query.getonly) {
                    if (Array.isArray(menuOrderItems) && Array.isArray(serviceOrderItems) &&
                        (menuOrderItems.length || serviceOrderItems.length)) {
                        // insert into database
                        order = this.realmOrder.formatRealmObj(this.realmOrder.createOrder(voiceDevice.id, menuOrderItems, serviceOrderItems));
                    }
                }
                return order;
            } else {
                return authorization;
            }
        }, res);
    }

    getKeywords (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.query, [{
            name: 'restaurant-id',
            type: 'string',
            nvalues: ''
        }]);
        const that = this;
        this.handleRequest(reqValid, () => {
            let authorization = that.authorization.request(req.accountId, 'Restaurant', req.query['restaurant-id']);
            if (authorization && !authorization.error) {
                // get menu by restaurant id
                let menu = this.realmMenu.getMenuByRestaurantId(req.query['restaurant-id'])[0];
                menu = this.realmMenu.formatRealmObj(menu);

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
            } else {
                return authorization;
            }
        }, res);
    }
}
module.exports = OrderController;

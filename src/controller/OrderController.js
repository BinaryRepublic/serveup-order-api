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
        this.getOrder = this.getOrder.bind(this);
    };
    getOrder (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.body, ['order']);
        this.handleRequest(reqValid, () => {
            // TEST >>>>> no voice device
            let menu;
            let voiceDevice = this.realmVoiceDevice.formatRealmObj(this.realmVoiceDevice.objectWithClassName('VoiceDevice'));
            if (!voiceDevice.length) {
                // get restaurant
                let restaurant = this.realmMenu.objectWithClassName('Restaurant');
                if (restaurant.length) {
                    restaurant = this.realmMenu.formatRealmObj(restaurant)[0];
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
                if (menu) {
                    menu = menu[0];
                } else {
                    return {error: 'no menu found'};
                }
            }

            let input = req.body.order;

            let nlpAlgorithm = require('../library/nlpAlgorithm/main');
            let order = nlpAlgorithm(menu, input, req.originalUrl);

            // insert order
            this.realmOrder.createOrder(voiceDevice.id, order);

            return order;
        }, res);
    }
}
module.exports = OrderController;

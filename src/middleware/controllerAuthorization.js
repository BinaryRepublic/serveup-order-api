'use strict';

const RealmAccountController = require('../../ro-realm/controller/RealmAccountController');
const RealmMenuController = require('../../ro-realm/controller/RealmMenuController');
const RealmOrderController = require('../../ro-realm/controller/RealmOrderController');
const RealmRestaurantController = require('../../ro-realm/controller/RealmRestaurantController');
const RealmVoiceDeviceController = require('../../ro-realm/controller/RealmVoiceDeviceController');

class Authorization {
    constructor () {
        this.realmAccountController = new RealmAccountController();
        this.realmMenuController = new RealmMenuController();
        this.realmOrderController = new RealmOrderController();
        this.realmRestaurantController = new RealmRestaurantController();
        this.realmVoiceDeviceController = new RealmVoiceDeviceController();
    }
    request (accountId, requestClassName, requestId) {
        if (accountId === 'root') {
            return true;
        }
        // get restaurantId
        let restaurantId = false;
        switch (requestClassName) {
        case 'Menu':
            let menu = this.realmMenuController.getMenuById(requestId);
            if (menu) {
                restaurantId = menu.restaurantId;
            }
            break;
        case 'Order':
            let order = this.realmOrderController.getOrderById(requestId);
            if (order) {
                restaurantId = order.restaurantId;
            }
            break;
        case 'VoiceDevice':
            let voiceDevice = this.realmVoiceDeviceController.getVoiceDeviceById(requestId);
            if (voiceDevice) {
                restaurantId = voiceDevice.restaurantId;
            }
            break;
        case 'Restaurant':
            restaurantId = requestId;
            break;
        }
        // get accountId by restaurantId
        if (restaurantId) {
            let restaurant = this.realmRestaurantController.getRestaurantById(restaurantId);
            if (restaurant) {
                let account = this.realmAccountController.getAccountById(restaurant.accountId);
                if (account && account.id === accountId) {
                    return true;
                }
            }
        }
        return {
            error: {
                type: 'NOT_AUTHORIZED',
                msg: 'This ressource is not available for you. Please use fitting credentials.'
            }
        };
    }
}
module.exports = Authorization;

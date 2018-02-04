'use strict';

const APIController = require('./APIController');
const RealmOrderController = require('../../ro-realm/controller/RealmOrderController');

class OrderController extends APIController {
    constructor () {
        super();
        this.realmController = new RealmOrderController();
        this.getOrder = this.getOrder.bind(this);
    };
    getOrder (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.body, ['order', 'voiceDeviceId']);
        this.handleRequest(reqValid, () => {
            let input = req.body.order;
            // load menu from database
            // sample menu
            let menu = require('../library/testJSON/menu');

            let nlpAlgorithm = require('../library/nlpAlgorithm/main');
            let order = nlpAlgorithm(menu, input, req.originalUrl);

            let voiceDeviceId = req.body.voiceDeviceId;
             // ########
             // TBD: Add new order to database

            return order;
        }, res);
    }
}
module.exports = OrderController;

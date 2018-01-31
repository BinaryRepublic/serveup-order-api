'use strict';

const APIController = require('./APIController');
const RealmDrinkController = require('../../ro-realm/controller/RealmDrinkController');

class OrderController extends APIController {
    constructor () {
        super();
        this.realmController = new RealmDrinkController();
        this.getOrder = this.getOrder.bind(this);
    };
    getOrder (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.body, ['order']);
        this.handleRequest(reqValid, () => {
            let input = req.body.order;
            // load menu from database
            // sample menu
            let menu = require('../library/testJSON/menu');

            let nlpAlgorithm = require('../library/nlpAlgorithm/main');
            let order = nlpAlgorithm(menu, input, req.originalUrl);

            return order;
        }, res);
    }
}
module.exports = OrderController;

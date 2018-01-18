exports.sendOrder = function (req, res) {
    let input = req.body.order;
    let menu = require('../library/testJSON/menu');
    let order = require("../library/orderAlgorithm").main(menu, input, req.originalUrl);
    res.json(order);
};
exports.sendOrder = function (req, res) {
    let input = req.body.order;
    let menu = require('../library/testJSON/menu');

    let ordertest = false;
    if (req.originalUrl === "/testorder") {
        ordertest = true;
    }

    let order = require("../library/orderAlgorithm").main(menu, input, ordertest);
    res.json(order);
};
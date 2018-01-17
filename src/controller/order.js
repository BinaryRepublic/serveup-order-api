exports.sendOrder = function (req, res) {
    let menu = ["Wasser", "Cola", "Bier"];
    let input = req.body.order;
    let order = require("../library/orderAlgorithm").main(menu, input);
    res.json(order);
};

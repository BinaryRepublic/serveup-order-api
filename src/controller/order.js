exports.sendOrder = function (req, res) {
    var menu = ["Wasser", "Cola", "Bier"];
    var input = req.body.params.order;
    var order = require("../library/orderAlgorithm").main(menu, input);
    res.send("Du hast " + order.join(" und ") + " bestellt.");
};

exports.sendOrder = function (req, res) {
    var menu = ["Wasser", "Cola", "Bier"];
    var input = "Ich will liebend gerne ein Cola und eine Cola trinken!";
    var order = require("../library/orderAlgorithm").main(menu, input);
    res.send("Du hast " + order.join(" und ") + " bestellt.");
};

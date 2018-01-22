exports.sendOrder = function (req, res) {
    let input = req.body.order;
    let menu = require('../library/testJSON/menu');

    let nlpAlgorithm = require("../library/nlpAlgorithm/main");
    let order = nlpAlgorithm(menu, input, req.originalUrl);

    res.json(order);
};
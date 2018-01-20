const Router = require('express').Router();

Router.post('/order', require("./controller/order").sendOrder);
Router.post('/testorder', require("./controller/order").sendOrder);
Router.post('/apporder', require("./controller/order").sendOrder);

module.exports = Router;
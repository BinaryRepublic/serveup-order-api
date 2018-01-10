const Router = require('express').Router();

Router.post('/order', require("./controller/order").sendOrder);

module.exports = Router;
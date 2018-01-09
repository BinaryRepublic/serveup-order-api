const Router = require('express').Router();

Router.get('/test', require("./controller/main").test);

module.exports = Router;
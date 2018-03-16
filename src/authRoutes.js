const Router = require('express').Router();

const AuthController = require('./controller/AuthController');

let authController = new AuthController();
Router.post('/login', authController.login);

module.exports = Router;

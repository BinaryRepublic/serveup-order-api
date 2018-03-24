const Router = require('express').Router();

const AuthController = require('./controller/AuthController');

let authController = new AuthController();
Router.post('/login', authController.login);
Router.delete('/logout/:accessToken', authController.logout);

module.exports = Router;

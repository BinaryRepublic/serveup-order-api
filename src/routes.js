const Router = require('express').Router();

const OrderController = require('./controller/OrderController');

let orderController = new OrderController();
Router.get('/order', orderController.getOrder);
Router.put('/order/status', orderController.updateOrderStatus);
Router.post('/order', orderController.postOrder);
Router.post('/testorder', orderController.postOrder);
Router.post('/apporder', orderController.postOrder);

Router.get('/orderkeywords', orderController.getKeywords);

module.exports = Router;

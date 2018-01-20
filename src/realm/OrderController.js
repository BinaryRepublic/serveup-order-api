"use_strict"
const uuidv4 = require('uuid/v4');

class OrderController {
	constructor(realmController) {
		this.realmController = realmController
	}
	addOrder(order) {
		if(this.orderObjectIsValid(order)) {
			order.timestamp = new Date();
			order.orderId = uuidv4();
			this.realmController.addOrder(order);
		}
		else {
			console.error("ERROR: order object is not valid");
			console.error(order);
		}
	}
	orderObjectIsValid(orderObject) {
		var valid = false
		// if(orderObject.items && orderObject.items.length > 0) {
		// 	valid = true
		// }
		// else {
		// 	return valid;
		// }
		// if(orderObject.amount && typeof(orderObject.amount) === "number") {
		// 	valid = true
		// }
		// else {
		// 	return valid;
		// }
		// if(orderObject.table && typeof(orderObject.table) === "object") {
		// 	valid = true
		// }
		// else {
		// 	return valid;
		// }
		valid = true;
		return valid
	}
}
module.exports = OrderController;
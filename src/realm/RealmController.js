"use_strict";
const ParentRealmController = require("../../ro-realm/ParentRealmController.js");

class RealmController extends ParentRealmController {
	addOrder(order) {
		this.realm.write(() => {
			let newOrder = this.realm.create("Order", order);
		});
	}
}
module.exports = RealmController;
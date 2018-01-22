const Helper = require('../helper');
const cfg = require('../cfg');

class finalOrder {

    constructor (menu, orderBlocks) {
        this.menu = menu;
        this.orderBlocks = orderBlocks;

        this.createOrder = this.createOrder.bind(this);
    }

    getTypeVal (type, orderBlockIndex) {
        let worker = this.orderBlocks.slice();
        return worker[orderBlockIndex].filter((x) => {
            return x[type]
        }, worker[orderBlockIndex])[0];
    }
    createOrder () {
        let drinks = this.menu.drinks;
        let order = [];
        for (let x = 0; x < this.orderBlocks.length; x++) {
            let nb = this.getTypeVal('nb', x);
            let size = this.getTypeVal('size', x);
            let product = this.orderBlocks[x].product;

            let newOrder = {};

            if (product) {
                // generate product name
                let menuPos = product.menuPos;
                let menuObj = drinks[menuPos[0]];
                for (let y = 1; y < menuPos.length; y++) {
                    menuObj = menuObj.child[menuPos[y]];
                }
                newOrder.name = menuObj.productName;
                // number
                if (nb) {
                    newOrder.nb = nb.val;
                } else {
                    // default 1
                    newOrder.nb = 1;
                }
                // size
                if (size) {
                    let variations = Helper.orderObjArray(menuObj.var, "size");
                    newOrder.size = false;
                    if (size.val === 'big') {
                        newOrder.size = variations[variations.length-1].size;
                    } else if (size.val === 'small') {
                        newOrder.size = variations[0].size;
                    } else if (!isNaN(size.val)) {
                        newOrder.size = size.val;
                    }
                    if (!newOrder.size) {
                        // QUESTION size not available
                    }
                } else {
                    // search for default
                    menuObj.var = menuObj.var.filter((x) => {
                        return x.default;
                    }, menuObj.var);
                    if (menuObj.var.length) {
                        newOrder.size = menuObj.var[0].size;
                    } else {
                        // QUESTION no default size defined
                    }
                }
                order.push(newOrder);
            } else {
                // WEITERMACHEN
                // QUESTION product not defined > should be impossible because of splitting
            }
        }
        return order;
    }
}

module.exports = finalOrder;
'use strict';

const expect = require('chai').expect;
const MenuAlg = require('../src/library/menuAlgorithm/main');

function menuAlgorithm (orderStr) {
    let menu = require('./mockData/menuAlgorithm/menu');
    let menuAlg = new MenuAlg(menu);
    return menuAlg.getOrder(orderStr);
}

describe('MenuAlgorithm', () => {
    it('Get order from sample sentences', (done) => {
        let expectations = require('./mockData/menuAlgorithm/orderExpectations');
        expectations.forEach(item => {
            let result = menuAlgorithm(item.order);
            expect(result).to.deep.equal(item.expect);
        });
        done();
    });
});

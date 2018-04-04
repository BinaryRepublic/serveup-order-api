'use strict';

const expect = require('chai').expect;
const ServiceAlg = require('../src/library/serviceAlgorithm/main');

function serviceAlgorithm (orderStr) {
    let menuAlg = new ServiceAlg();
    return menuAlg.getOrder(orderStr);
}

describe('ServiceAlgorithm', () => {
    it('Get order from sample sentences', (done) => {
        let expectations = require('./mockData/serviceAlgorithm/orderExpectations');
        expectations.forEach(item => {
            let result = serviceAlgorithm(item.order);
            expect(result).to.deep.equal(item.expect);
        });
        done();
    });
});

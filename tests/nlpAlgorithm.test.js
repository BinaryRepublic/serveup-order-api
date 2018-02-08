'use strict';

const expect = require('chai').expect;
const nlpAlg = require('../src/library/nlpAlgorithm/main');

function getOrder (orderStr) {
    let menu = require('./mockData/menu');
    return nlpAlg(menu, orderStr, '');
}

describe('OrderController', () => {
    it('Get order from sample sentences', (done) => {
        let expectations = require('./mockData/orderExpectations');
        expectations.forEach(item => {
            let result = getOrder(item.order);
            expect(result).to.deep.equal(item.expect);
        });
        done();
    });
});

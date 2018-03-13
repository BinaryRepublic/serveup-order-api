'use strict';

const expect = require('chai').expect;
const nlpAlg = require('../src/library/nlpAlgorithm/main');

function nlpAlgorithm (orderStr) {
    let menu = require('./mockData/nlpAlgorithm/menu');
    return nlpAlg(menu, orderStr, '');
}

describe('NlpAlgorithm', () => {
    it('Get order from sample sentences', (done) => {
        let expectations = require('./mockData/nlpAlgorithm/orderExpectations');
        expectations.forEach(item => {
            let result = nlpAlgorithm(item.order);
            expect(result).to.deep.equal(item.expect);
        });
        done();
    });
});

'use strict';

class RequestValidator {
    validRequestData (data, necessaryData) {
        let valid = true;
        for (let x = 0; x < necessaryData.length; x++) {
            let necessaryElem = necessaryData[x];
            if (!data.hasOwnProperty(necessaryElem)) {
                valid = false;
                console.error('MISSING: ' + necessaryElem);
                break;
            }
        }
        return valid;
    };
}
module.exports = RequestValidator;

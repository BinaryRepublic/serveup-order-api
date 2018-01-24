'use_strict'

const RequestValidator = require('./RequestValidator');

class APIController {
    constructor() {
        this.requestValidator = new RequestValidator();
    };
    handleRequest (requestValid, databaseCallback, res) {
        if (requestValid) {
            let result = databaseCallback();
            this.handleResponse(res, result);
        } else {
            res.sendStatus(400);
        }
    };
    handleResponse (res, jsonObject) {
        if(jsonObject) {
            res.json(jsonObject);
        } else {
            res.sendStatus(500);
        }
    };
}
module.exports = APIController;
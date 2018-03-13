'use strict';

const RequestValidator = require('./RequestValidator');

class APIController {
    constructor () {
        this.requestValidator = new RequestValidator();
    };
    handleRequest (requestValidError, databaseCallback, res) {
        if (requestValidError === false) {
            let result = databaseCallback();
            this.handleResponse(res, result);
        } else {
            let badRequest = {
                error: requestValidError
            };
            res.status(400).json(badRequest);
        }
    };
    handleResponse (res, jsonObject) {
        if (jsonObject) {
            if (jsonObject.error === undefined) {
                res.json(jsonObject);
            } else {
                res.status(500).json(jsonObject);
            }
        } else {
            res.sendStatus(500);
        }
    };
}
module.exports = APIController;

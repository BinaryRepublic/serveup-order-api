class Router {
    constructor () {
        this.responseStatus = 200;
    }
    static simulate (controllerMethod, params = {}) {
        let getParams = (params.query) ? params.query : {};
        let postParams = (params.body) ? params.body : {};
        return new Promise((resolve) => {
            let req = {
                query: getParams,
                body: postParams
            };
            let res = {
                status: status => {
                    this.responseStatus = status;
                    return res;
                },
                sendStatus: status => {
                    if (status !== 200) {
                        resolve({
                            status: status
                        });
                    }
                },
                json: response => {
                    let status = this.responseStatus;
                    if (status !== 200) {
                        this.responseStatus = 200;
                    }
                    resolve({
                        status: status,
                        body: response
                    });
                }
            };
            controllerMethod(req, res);
        });
    }
}
module.exports = Router;

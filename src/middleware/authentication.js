const AuthApiInterface = require('../library/AuthApiInterface');

module.exports = (req, res, next) => {
    // disable authentication for unit tests
    if (req.get('Access-Token') === 'unittest' && req.hostname === '127.0.0.1') {
        // disable authorization for unit tests
        req.accountId = 'root';
        next();
    } else {
        let authApi = new AuthApiInterface();
        let accessToken = req.header('Access-Token');
        if (!accessToken) {
            res.status(400).json({
                error: {
                    type: 'ACCESS_TOKEN_MISSING',
                    msg: 'Please send a valid access-token in the request header.'
                }
            });
        } else {
            authApi.access(accessToken).then(resp => {
                req.accountId = resp.clientId;
                next();
            }).catch((err) => {
                // default error
                let error = {
                    type: 'ACCESS_TOKEN_INVALID',
                    msg: 'Please send a valid access-token in the request header.'
                };
                let body = err.response.data;
                if (body && body.error) {
                    error = body.error;
                }
                res.status(400).json({
                    error: error
                });
            });
        }
    }
};

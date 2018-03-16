const axios = require('axios');

class AuthApi {
    constructor () {
        if (process.env.DEV) {
            this.host = 'auth-api-dev';
        } else if (process.env.STAGE) {
            this.host = 'auth-api-stage';
        } else if (process.env.PROD) {
            this.host = 'auth-api';
        } else if (process.env.LOCAL) {
            this.host = 'localhost';
        }
        this.port = 4000;
    }
    post (route, params) {
        return new Promise((resolve, reject) => {
            axios.post('http://' + this.host + ':' + this.port + route, params).then(response => {
                if (response.status === 200) {
                    resolve(response.data);
                }
            }).catch(err => {
                reject(err);
            });
        });
    }
    access (accessToken) {
        return new Promise((resolve, reject) => {
            this.post('/access', {
                accessToken: accessToken
            }).then(response => {
                resolve(response);
            }).catch(err => {
                reject(err);
            });
        });
    }
    grant (grant, accountId) {
        return new Promise((resolve, reject) => {
            this.post('/grant', {
                grant: grant,
                accountId: accountId
            }).then(response => {
                resolve(response);
            }).catch(err => {
                reject(err);
            });
        });
    }
}
module.exports = AuthApi;

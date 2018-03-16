'use strict';

const APIController = require('./APIController');
const RealmAccountController = require('../../ro-realm/controller/RealmAccountController');
const RealmVoiceDeviceController = require('../../ro-realm/controller/RealmVoiceDeviceController');

const AuthApiInterface = require('../library/AuthApiInterface');

const uuidv4 = require('uuid/v4');

class AuthController extends APIController {
    constructor () {
        super();
        this.realmAccount = new RealmAccountController();
        this.realmVoiceDevice = new RealmVoiceDeviceController();
        this.login = this.login.bind(this);
        this.authApi = new AuthApiInterface();
    };

    login (req, res) {
        let reqValid = this.requestValidator.validRequestData(req.body, [{
            name: 'mail',
            type: 'string',
            nvalues: ['']
        },
        {
            name: 'password',
            type: 'string',
            nvalues: ['']
        }]);
        this.handleRequest(reqValid, () => {
            let account = this.realmAccount.objectsWithFilter('Account', 'mail == "' + req.body.mail + '" && password == "' + req.body.password + '"');
            account = this.realmAccount.formatRealmObj(account)[0];
            if (account !== undefined) {
                let newGrant = uuidv4();
                this.authApi.grant(newGrant, account.id);
                return {
                    accountId: account.id,
                    grant: newGrant
                };
            }
        }, res);
    }
}
module.exports = AuthController;

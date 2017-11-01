var Arrow = require('arrow'),
	Dtcarrow = require('dtcarrow'),
	Q = require('q');

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/password/activate',
	method: 'GET',
	description: 'Gets information needed to activate an account'
		+ '<br>Note: This API always returns 200 success, so it doesnt block the resolver from loading',
	parameters: {
		clientactivatekey: { description: 'clientActivatekey' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'activate-get.js>action'
		}

		var activatekeyobject = Dtcarrow.Api.decryptClientApikey(req.params.clientactivatekey);
		if (!activatekeyobject.success) {
			// This API always returns 20x success, so it doesnt block the resolver from loading
			activatekeyobject.status = 204;
			activatekeyobject.success = false;
			activatekeyobject.caller = nextOutput.caller + '>' + activatekeyobject.caller;
			Dtcarrow.Common.nextFail(nextBase, activatekeyobject);
		}

		if (!Dtcarrow.Api.testExpiration(activatekeyobject.data.expiration)) {
			// This API always returns 20x success, so it doesnt block the resolver from loading
			nextOutput.status = 204;
			nextOutput.success = false;
			nextOutput.data = { message: 'expired activate key', expired: true };
			Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
			return;
		}
		
 		var user = getUserByActivatekey(activatekeyobject.data.apikey)
 			.done(function(getUserByActivatekeyResult) {
 				getUserByActivatekeyResult.caller = nextOutput.caller + '>' + getUserByActivatekey.caller + '>getUserByActivatekeyResult';
 				Dtcarrow.Common.nextSuccess(nextBase, getUserByActivatekeyResult);
 				return;
 			}, function(err) {
 				// This API always returns 20x success, so it doesnt block the resolver from loading
 				err.status = 204;
 				err.success = false;
 				err.data = { message: err, expired: true };
 				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
 				Dtcarrow.Common.warn(err.caller + ':' + err);
 				Dtcarrow.Common.nextSuccess(nextBase, err);
 				return;
 			})
	}
});

// Internal functions
function getUserByActivatekey(activatekey) {
    var deferred = Q.defer();

	if (typeof activatekey === 'undefined') {
        deferred.reject({ success: false, status: 404, caller: 'activate.js>getUserByActivatekey', 
        	data: 'activatekey undefined' });
        return deferred.promise;
	}

    var Model = Arrow.getModel('appc.mysql.eolmig/User');
    Model.query({ apikey: activatekey }, function(err, user) {
        if (err) {
            deferred.reject({ success: false, status: 500, caller: 'activate.js>getUserByActivatekey',
            	data:err });
            return deferred.promise;
        }

        if (typeof user === 'undefined' || user.length === 0) {
            deferred.reject({ success: false, status: 404, caller: 'activate.js>getUserByActivatekey',
            	data: 'User not found' });
            return deferred.promise;
        }

        deferred.resolve({ success: true, status: 200, caller: 'activate.js>getUserByActivateKey', 
        	data: user[0] });
    });

    return deferred.promise;
}

module.exports = Module;

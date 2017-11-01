var Arrow = require('arrow'),
	Dtcarrow = require('dtcarrow'),
	Q = require('q');

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/password/fulfillreset',
	method: 'GET',
	description: 'Gets information needed to fulfill a password reset request'
		+ '<br>Note: This API always returns 200 success, so it doesnt block the resolver from loading',
	parameters: {
		clientresetkey: { description: 'clientResetkey' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'fulfillreset-get.js>action'
		}

		var decryptClientApikeyResult = Dtcarrow.Api.decryptClientApikey(req.params.clientresetkey);

		if (!decryptClientApikeyResult.success) {
			nextOutput.status = 204;
			nextOutput.success = false;
			nextOutput.caller += '>decryptClientApikeyResult';
			nextOutput.data = 'Problems decrypting clientApikey';
			Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
			return;
		}

		if (!Dtcarrow.Api.testExpiration(decryptClientApikeyResult.data.expiration)) {
			nextOutput.status = 204;
			nextOutput.success = false;
			nextOutput.caller += '>testExpirationResult';
			nextOutput.data = { message: 'expired resetkey', expired: true };
			Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
			return;
		}
		
 		getUserByResetkey(decryptClientApikeyResult.data.apikey)
 			.done(function(getUserByResetkeyResult) {
 				getUserByResetkeyResult.caller = nextOutput.caller + '>' + getUserByResetkeyResult.caller + '>getUserByResetkeyResult';
 				Dtcarrow.Common.nextSuccess(nextBase, getUserByResetkeyResult);
 			}, function(err) {
 				// This API always returns 20x success, so it doesnt block the resolver from loading
				err.status = 204;
				err.success = false;
				err.caller = nextOutput.caller + '>' + err.caller + '>getUserByResetkey>fail';
 				Dtcarrow.Common.nextSuccess(nextBase, err);
 			})
	}
});

// Internal functions
function getUserByResetkey(resetkey) {
    var deferred = Q.defer();

	if (typeof resetkey === 'undefined') {
        deferred.reject({ success: false, status: 404, caller: 'getUserByResetkey', 
        	data: 'resetkey undefined' });
        return deferred.promise;
	}

    var Model = Arrow.getModel('appc.mysql.eolmig/User');
    Model.query({ resetkey: resetkey }, function(err, user) {
        if (err) {
            deferred.reject({ success: false, status: 500, caller: 'getUserByResetkey>query', 
        	data: err });
            return deferred.promise;
        }

        if (typeof user === 'undefined' || user.length === 0) {
            deferred.reject({ success: false, status: 404, caller: 'getUserByResetkey>query', 
        	data: 'User not found!' });
            return deferred.promise;
        }

        deferred.resolve({ success: true, status: 200, caller: 'getUserByResetkey>query', 
        	data: user[0] });
    });

    return deferred.promise;
}

module.exports = Module;
